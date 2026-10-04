import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schema";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
if (!projectId || !dataset) throw new Error("Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET to start the editing studio.");

export default defineConfig({
  name: "daat",
  title: "DAAT Studio",
  projectId,
  dataset,
  plugins: [structureTool({
    structure: (builder) => builder.list().title("DAAT").items([
      builder.listItem().title("Site settings").child(builder.document().schemaType("siteSettings").documentId("siteSettings")),
      ...builder.documentTypeListItems().filter((item) => item.getId() !== "siteSettings"),
    ]),
  })],
  schema: { types: schemaTypes },
});
