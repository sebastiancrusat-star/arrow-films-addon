const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");

// Cargamos el archivo JSON que tiene la metadata
const movies = JSON.parse(fs.readFileSync("./datos_movies.json", "utf8"));

const manifest = {
    id: "org.arrow.addon",
    version: "1.0.0",
    name: "Arrow 4K Collection",
    description: "Catálogo Arrow Video con afiches y metadata",
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [{ 
        type: "movie", 
        id: "arrow_catalog", 
        name: "Arrow Library" 
    }],
    idPrefixes: ["tmdb"]
};

const builder = new addonBuilder(manifest);

// Manejador del catálogo: muestra todas las películas
builder.defineCatalogHandler(({ extra }) => {
    return Promise.resolve({ metas: movies });
});

// Manejador de metadatos: muestra la info al hacer clic en una película
builder.defineMetaHandler(({ id }) => {
    const movie = movies.find(m => m.id === id);
    if (movie) {
        return Promise.resolve({ meta: movie });
    } else {
        return Promise.reject("Movie not found");
    }
});

// Inicia el servidor en el puerto que asigne Render
serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
