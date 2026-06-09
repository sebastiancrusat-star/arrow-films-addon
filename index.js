const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");

// Cargamos la base de datos
const movies = JSON.parse(fs.readFileSync("./datos_movies.json", "utf8"));

const manifest = {
    id: "org.arrow.addon.final",
    version: "1.0.1",
    name: "Arrow 4K Collection",
    description: "Catálogo Arrow Video compatible con todos los addons RD",
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [{ 
        type: "movie", 
        id: "arrow_catalog", 
        name: "Arrow Library" 
    }],
    // Aceptamos ambos formatos para que Comet/Torrentio no se pierdan
    idPrefixes: ["tt", "tmdb"] 
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(() => {
    return Promise.resolve({ metas: movies });
});

builder.defineMetaHandler(({ id }) => {
    const movie = movies.find(m => m.id === id);
    return Promise.resolve({ meta: movie ? movie : null });
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
