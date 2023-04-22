import React, { useState, useEffect, useCallback } from "react";

import MoviesList from "./components/MoviesList";
import AddMovie from "./components/AddMovie";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://reactreq-default-rtdb.firebaseio.com/movies.json"
      );
      if (!response.ok) {
        throw new Error("Something went wrong! Retrying...");
      }

      const data = await response.json();

      const loadedMovies = [];

      for (const key in data) {
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate
        });
      }

      setMovies(loadedMovies);
      setRetryCount(0);
    } catch (error) {
      setError(error.message);
      setRetryCount((prevRetryCount) => prevRetryCount + 1);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const retryTimer = setTimeout(() => {
      if (retryCount > 0) {
        fetchMoviesHandler();
      }
    }, 5000);
    return () => {
      clearTimeout(retryTimer);
    };
  }, [retryCount, fetchMoviesHandler]);

  async function addMovieHandler(movie) {
    const response = await fetch(
      "https://reactreq-default-rtdb.firebaseio.com/movies.json",
      {
        method: "POST",
        body: JSON.stringify(movie),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    const data = await response.json();
    console.log(data);
  }

  let content = <p>Found no movies.</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }

  if (error) {
    content = (
      <React.Fragment>
        <p>{error}</p>
        <button onClick={() => setRetryCount(1)}>Retry</button>
      </React.Fragment>
    );
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>
        {content}
        {retryCount > 0 && (
          <button onClick={() => setRetryCount(0)}>Cancel Retry</button>
        )}
      </section>
    </React.Fragment>
  );
}

export default App;
