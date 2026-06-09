const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");

const movies = JSON.parse(fs.readFileSync("./datos_movies.json", "utf8"));

const manifest = {
    id: "org.arrow.addon",
    version: "1.0.0",
    name: "Arrow Video Collection",
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [{ type: "movie", id: "arrow_catalog", name: "Arrow Library" }],
    idPrefixes: ["tt"] // Esto le dice a Stremio que busque IDs tipo IMDb
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(({ extra }) => {
    // Si tienes un campo "imdb_id" en tu JSON, úsalo. Si no, usaremos nombres.
    return Promise.resolve({ metas: movies.map(m => ({
        id: m.imdb_id || "tt0000000", // Aquí Stremio intentará buscar
        type: "movie",
        name: m.name,
        description: m.description
    })).slice(0, 100) });
});

builder.defineMetaHandler(({ id }) => {
    // Busca en Cinemeta el afiche y metadatos usando el ID
    return fetch(`https://v3-cinemeta.strem.io/meta/movie/${id}.json`)
        .then(res => res.json())
        .then(data => ({ meta: data.meta }));
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
