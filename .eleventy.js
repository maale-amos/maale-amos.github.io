export default async function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/vendor");
  eleventyConfig.addPassthroughCopy({"src/robots.txt": "robots.txt"});
  eleventyConfig.addPassthroughCopy({"src/manifest.json": "manifest.json"});
  eleventyConfig.addPassthroughCopy({"src/sw.js": "sw.js"});
  eleventyConfig.addPassthroughCopy({"src/.well-known": ".well-known"});
  eleventyConfig.addPassthroughCopy({"SECURITY.md": "SECURITY.md"});
  eleventyConfig.addPassthroughCopy({"data": "data"});
  eleventyConfig.addPassthroughCopy({"src/_data/sections": "data/sections"});
  // מקור אמת אחד לאינדקס הסקציות: היה קובץ כפול (data/sections.json) שסונכרן ביד
  // מול src/_data/sections.json ונטה להיפרד. הכפילות הוסרה — הבנייה מייצרת את
  // /data/sections.json מהמקור היחיד, וזה מה שהפאנל טוען ב-runtime.
  eleventyConfig.addPassthroughCopy({"src/_data/sections.json": "data/sections.json"});

  // safeUrl — reject javascript:/data:/vbscript: schemes when interpolating
  // admin-editable URLs into templates. Falls back to '#' for unknown schemes.
  // Fixes H-M3 in the 2026-07-08 audit (moovitUrl/mapUrl javascript: injection).
  eleventyConfig.addFilter('safeUrl', (u) => {
    if (typeof u !== 'string') return '#';
    const t = u.trim();
    if (!t) return '#';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(t)) return t;
    if (t.startsWith('/') || t.startsWith('#')) return t;
    return '#';
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
}
