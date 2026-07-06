export default async function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy({"src/robots.txt": "robots.txt"});
  eleventyConfig.addPassthroughCopy({"src/manifest.json": "manifest.json"});
  eleventyConfig.addPassthroughCopy({"src/sw.js": "sw.js"});
  eleventyConfig.addPassthroughCopy({"data": "data"});
  eleventyConfig.addPassthroughCopy({"src/_data/sections": "data/sections"});
  // src/_data/sections.json conflicts with data/sections.json — admin loads from /data/sections.json (the runtime one, kept in sync manually)

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
