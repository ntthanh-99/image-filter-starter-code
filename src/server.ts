import express, { Router, Request, Response } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();
  const fs = require("fs");
  const path = require("path");
  // Set the network port
  const port = process.env.PORT || 8082;
  let url = "src/util/tmp";

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get("/filteredimage/", async (req: Request, res: Response) => {
    //    1. validate the image_url query
    //    image_url: URL of a publicly accessible image
    let { image_url }: any = req.query;
    if (!image_url) {
      return res.status(400).send(`image_url is required`);
    }

    //    2. call filterImageFromURL(image_url) to filter the image
    const image = await filterImageFromURL(image_url);

    //    3. send the resulting file in the response
    res.sendFile(image, function (err: any) {
      //    4. deletes any files on the server on finish of the response
      const files = fs.readdirSync(url);
      const absolutePaths: Array<string> = [];
      files.forEach((file: File) => {
        absolutePaths.push(path.join(url, file));
      });
      deleteLocalFiles(absolutePaths);
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
