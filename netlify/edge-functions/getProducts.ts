import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { HTMLRewriter } from "https://raw.githubusercontent.com/worker-tools/html-rewriter/master/index.ts";

import type { Context } from "https://edge.netlify.com/";
type Product = {

  Name: string;

  price: number;
};

export default async (_request: Request, context: Context) => {
  try {
    const config = Deno.env.get("POLYSCALE_SUPERBASE_URL");
    context.log(`The Edge function fired - Your Env Var is  ${config}`);
    const client = new Client(config);
    await client.connect();
    
    const response = await context.next();
    const result = await client.queryObject("SELECT * FROM products");
    console.log (`result is ${JSON.stringify(result)}`);
    const products: Product[] = result.rows as Product[];
    console.log (`products is ${JSON.stringify(products)}`);
    const productsHTML = products.map((product) => {
        console.log (product)
        console.log(`product name is ${JSON.stringify(product)}`);
      return `<p>${product.Name}</p>`;
    });

    return new HTMLRewriter()
      .on("span#products", {
        element(element) {
          element.replace(productsHTML.join(""), {
            html: true,
          });
        },
      })
      .transform(response);
  } catch (error) {
    console.log(error);
    return;
  }
};