const fs = require("fs");
const http = require("http");
const url = require("url");

//node will go into the node_modules folder and automatically find the slugify
const slugigy = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

/** SERVER */

// Read the file once upfront then we can reuse it
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const slug = dataObj.map((el) => slugigy(el.productName, { lower: true }));
console.log(slug);

//1. Create the server. Node is using callback to handle requests from users,
// whenever requests hit the server, the server will handle it in evenloop
// to make sure it does not block the entire server then
// whenever the server got result will return it back to users

const server = http.createServer((req, res) => {
  //routing
  //Put it simple: you get the url then you do if-else; so routing for different URL path
  //That you want to handle differently

  //const pathName = req.url;
  //console.log(url.parse(req.url, true));

  //descontruct object - have to use the property name (such: 'query', 'pathname') which are from the object
  const { query, pathname } = url.parse(req.url, true);

  //Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    //Product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });

    //query.id is the index position
    const product = dataObj[query.id];
    console.log(query.id);
    console.log(product);
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // Not found
  } else {
    //tell the browser that we return html tags
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

//2. Start the server, listening to requests
// You need to specify the specific port and host

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
