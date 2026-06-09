const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");

const movies = JSON.parse(fs.readFileSync("./datos_movies.json", "utf8"));

const manifest = {
    id: "org.arrow.addon",
    version: "1.0.0",
    name: "Arrow Video Collection",
    description: "Catálogo completo de Arrow Video con metadatos",
    resources: ["catalog", "meta", "stream"],
    types: ["movie"],
    catalogs: [{ type: "movie", id: "arrow_catalog", name: "Arrow Library" }],
    idPrefixes: ["arrow_"]
};

const builder = new addonBuilder(manifest);

// 1. Mostrar el catálogo
builder.defineCatalogHandler(({ extra }) => {
    return Promise.resolve({ metas: movies.slice(0, 100).map(m => ({
        id: "arrow_" + m.id.replace('movie_', ''),
        type: "movie",
        name: m.name,
        poster: null, // Stremio buscará el poster automáticamente por el nombre
        description: m.description
    }))});
});

// 2. Conectar con Cinemeta para afiches (META)
builder.defineMetaHandler(({ id }) => {
    const movieName = id.replace('arrow_', ''); // Lógica para recuperar nombre
    return fetch(`https://v3-cinemeta.strem.io/catalog/movie/top.json?search=${movieName}`)
        .then(res => res.json())
        .then(data => ({ meta: data.metas[0] || { name: movieName } }));
});

// 3. Reproducción (STREAM)
builder.defineStreamHandler(({ id }) => {
    // Aquí es donde entraría tu link de video si lo tienes en el JSON
    return Promise.resolve({ streams: [] });
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
