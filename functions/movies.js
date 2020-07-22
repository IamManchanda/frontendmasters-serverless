const { URL } = require("url");
const fetch = require("node-fetch");
const { query } = require("./util/hasura");

exports.handler = async () => {
  const { movies } = await query({
    query: `
      query readAllMovies {
        movies {
          id
          poster
          tagline
          title
        }
      }
    `,
  });

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
