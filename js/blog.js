// Load Blogger's public feed as JSONP and render posts in the site's own layout.
(function () {
  const feedUrl = "https://sytoursandtravels.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=6&callback=syRenderBlogFeed";
  const cacheKey = "sy-blog-feed-v1";
  const grid = document.getElementById("blogGrid");
  const status = document.getElementById("blogStatus");
  const reader = document.getElementById("blogReader");
  if (!grid || !status || !reader) return;
  let hasStories = false;

  // Reuse the last feed first so return visitors see stories without waiting on Blogger.
  try {
    const cachedFeed = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cachedFeed && Array.isArray(cachedFeed.entry)) {
      renderPosts(cachedFeed);
      hasStories = cachedFeed.entry.length > 0;
    }
  } catch (error) {
    console.warn("[SY] Could not read saved blog stories.", error);
  }

  // Create text elements instead of inserting feed titles and excerpts as HTML.
  function textElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(value, "https://sytoursandtravels.blogspot.com");
      return url.protocol === "https:" ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function postDetails(entry) {
    const parsed = new DOMParser().parseFromString(entry.content?.$t || entry.summary?.$t || "", "text/html");
    const text = parsed.body.textContent.replace(/\s+/g, " ").trim();
    const image = entry.media$thumbnail?.url || parsed.querySelector("img")?.src || "";
    const title = (entry.title?.$t || "").trim();
    const alternateLink = Array.isArray(entry.link) && entry.link.find(function (link) {
      return link.rel === "alternate" && link.type === "text/html";
    });
    let url = "";
    if (alternateLink?.href) {
      try {
        const parsedUrl = new URL(alternateLink.href);
        if (parsedUrl.protocol === "https:" && parsedUrl.hostname === "sytoursandtravels.blogspot.com") {
          url = parsedUrl.href;
        }
      } catch (error) {
        console.warn("[SY] Could not read a blog story URL.", error);
      }
    }
    return { entry, text, image: safeImageUrl(image), title, url };
  }

  function renderPosts(feed) {
    const posts = (Array.isArray(feed.entry) ? feed.entry : []).map(postDetails).filter(function (post) {
      return post.title || post.text || post.image;
    });

    if (!posts.length) {
      if (!hasStories) status.textContent = formatText("New stories are on the way. Check back soon.");
      return;
    }

    grid.replaceChildren();
    hasStories = true;
    status.textContent = "";
    posts.forEach(function (post) {
      const card = document.createElement("article");
      card.className = "blog-card";

      if (post.image) {
        const image = document.createElement("img");
        image.className = "blog-card-image";
        image.src = post.image;
        image.alt = post.title || "Goa travel story";
        image.loading = "lazy";
        image.decoding = "async";
        card.appendChild(image);
      }

      const body = document.createElement("div");
      body.className = "blog-card-body";
      const date = new Date(post.entry.published?.$t || "");
      if (!Number.isNaN(date.getTime())) {
        body.appendChild(textElement("time", "blog-date", new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(date)));
      }
      body.appendChild(textElement("h3", "blog-card-title", post.title || "Goa travel story"));
      body.appendChild(textElement("p", "blog-card-excerpt", post.text.slice(0, 190) + (post.text.length > 190 ? "..." : "")));

      const readButton = textElement(post.url ? "a" : "button", "blog-read-button", formatText("Read story"));
      if (post.url) {
        readButton.href = post.url;
      } else {
        readButton.type = "button";
      }
      readButton.addEventListener("click", function (event) {
        if (post.url) event.preventDefault();
        openPost(post);
      });
      body.appendChild(readButton);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  // Convert feed HTML into a small allowlist so Blogger scripts and styles never enter the page.
  function cleanPostContent(source) {
    const parsed = new DOMParser().parseFromString(source, "text/html");
    const allowed = new Set(["P", "BR", "DIV", "SPAN", "H2", "H3", "H4", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "BLOCKQUOTE", "A", "IMG", "FIGURE", "FIGCAPTION", "HR"]);

    function copyNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
      if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();

      const tag = node.tagName;
      if (!allowed.has(tag)) {
        const fragment = document.createDocumentFragment();
        node.childNodes.forEach(function (child) { fragment.appendChild(copyNode(child)); });
        return fragment;
      }

      const clean = document.createElement(tag.toLowerCase());
      if (tag === "A") {
        const href = safeImageUrl(node.getAttribute("href"));
        if (href) { clean.href = href; clean.target = "_blank"; clean.rel = "noopener noreferrer"; }
      }
      if (tag === "IMG") {
        const src = safeImageUrl(node.getAttribute("src"));
        if (!src) return document.createDocumentFragment();
        clean.src = src;
        clean.alt = node.getAttribute("alt") || "";
        clean.loading = "lazy";
      }
      node.childNodes.forEach(function (child) { clean.appendChild(copyNode(child)); });
      return clean;
    }

    const output = document.createDocumentFragment();
    parsed.body.childNodes.forEach(function (node) { output.appendChild(copyNode(node)); });
    return output;
  }

  function openPost(post) {
    const back = textElement("button", "blog-back-button", formatText("Back to stories"));
    grid.hidden = true;
    status.hidden = true;
    reader.hidden = false;
    reader.replaceChildren();

    back.type = "button";
    back.addEventListener("click", function () {
      reader.hidden = true;
      grid.hidden = false;
      status.hidden = false;
      window.scrollTo({ top: grid.offsetTop, behavior: "smooth" });
    });
    reader.appendChild(back);

    const date = new Date(post.entry.published?.$t || "");
    if (!Number.isNaN(date.getTime())) {
      reader.appendChild(textElement("time", "blog-date d-block mt-3", new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(date)));
    }
    reader.appendChild(textElement("h2", "blog-reader-title", post.title || "Goa travel story"));

    if (post.image) {
      const image = document.createElement("img");
      image.className = "blog-reader-image";
      image.src = post.image;
      image.alt = post.title || "Goa travel story";
      image.decoding = "async";
      reader.appendChild(image);
    }

    const content = document.createElement("div");
    content.className = "blog-reader-content";
    content.appendChild(cleanPostContent(post.entry.content?.$t || post.entry.summary?.$t || ""));
    reader.appendChild(content);
    window.scrollTo({ top: reader.offsetTop, behavior: "smooth" });
  }

  // Stop waiting once the feed responds or after 8 seconds.
  let feedTimer;
  window.syRenderBlogFeed = function (data) {
    window.clearTimeout(feedTimer);
    if (!data || !data.feed || !Array.isArray(data.feed.entry)) {
      showFeedError("Stories are temporarily unavailable. Please try again later.");
      return;
    }
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data.feed));
    } catch (error) {
      console.warn("[SY] Could not save blog stories for the next visit.", error);
    }
    renderPosts(data.feed);
  };
  const script = document.createElement("script");
  script.src = feedUrl;
  script.onerror = function () {
    window.clearTimeout(feedTimer);
    showFeedError("Stories are temporarily unavailable. Please try again later.");
  };
  feedTimer = window.setTimeout(function () {
    script.remove();
    showFeedError("Stories are taking longer to load. Please try again later.");
  }, 5000);
  document.head.appendChild(script);

  function showFeedError(text) {
    if (!hasStories) status.textContent = formatText(text);
    else status.textContent = formatText("Showing saved stories; the latest posts could not be refreshed.");
  }
})();