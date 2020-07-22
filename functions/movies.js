const { URL } = require("url");
const fetch = require("node-fetch");
const movies = require("../data/movies.json");

exports.handler = async () => {
  const api = new URL("https://www.omdbapi.com/");
  api.searchParams.set("apiKey", process.env.OMDB_API_KEY);
  const moviesWithApi = movies.map((movie) => {
    api.searchParams.set("i", movie.id);
    return fetch(api)
      .then((response) => response.json())
      .then((data) => {
        const { Ratings: scores } = data;
        return {
          ...movie,
          scores,
        };
      });
  });
  const moviesWithRatings = await Promise.all(moviesWithApi);
  return {
    statusCode: 200,
    body: JSON.stringify(moviesWithRatings),
  };
};
