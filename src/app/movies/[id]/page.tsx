


// Import the component that displays a list of movies.
import MovieGrid from "@/components/MovieGrid";

// Import the functions that fetch movie information from TMDB.
import {
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
} from "@/services/movieApi";

import Image from "next/image";

// Define the TypeScript type for the page props.
// "params" is a Promise containing the dynamic route parameters.
type MovieDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// This is an async Server Component.
// "async" allows us to use "await" for our API requests.
export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  // Wait for the route parameters and extract the movie ID.
  const { id } = await params;

  // Fetch the main information about this movie.
  const movie = await getMovieDetails(id);

  // Fetch the cast and crew information.
  const credits = await getMovieCredits(id);

  // Fetch movies similar to this movie.
  const similar = await getSimilarMovies(id);

  // Search the crew array for the person whose job is "Director".
  // "find()" returns the first item that matches the condition.
  const director = credits.crew.find(
    (person: { job: string }) => person.job === "Director"
  );

  // Return the UI for the movie details page.
  return (
    <main>

      {/* Display the movie backdrop if TMDB provides one. */}
{movie.backdrop_path && (
  <Image
    // Build the TMDB backdrop image URL.
    src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}

    // Alternative text describing the image.
    alt={movie.title}

    // Width of the displayed image.
    width={1280}

    // Height of the displayed image.
    height={720}
  />
)}

{/* Display the movie poster if one exists. */}
{movie.poster_path && (
  <Image
    // Build the TMDB poster image URL.
    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}

    // Alternative text describing the poster.
    alt={movie.title}

    // Width of the displayed poster.
    width={300}

    // Height of the displayed poster.
    height={450}
  />
)}
      {/* Display the movie title. */}
      <h1>{movie.title}</h1>

      {/* Display the movie description. */}
      <p>{movie.overview}</p>

      {/* Display the movie rating. */}
      <p>⭐ {movie.vote_average.toFixed(1)}</p>

      {/* Display the release date. */}
      <p>Release date: {movie.release_date}</p>

      {/* Display the runtime. */}
      <p>Runtime: {movie.runtime} minutes</p>

      {/* Display the movie's popularity score. */}
      <p>Popularity: {movie.popularity}</p>

      {/* Display all genres as a comma-separated list. */}
      <p>
        Genres: {movie.genres.map((genre) => genre.name).join(", ")}
      </p>

      {/* Display the director if one was found. */}
      <p>
        Director: {director ? director.name : "Unknown"}
      </p>

      {/* Display the first 10 cast members. */}
      <h2>Cast</h2>

      <ul>
        {credits.cast.slice(0, 10).map((person) => (
          // <li key={person.id}>
          //   {person.name} as {person.character}
          // </li>

          <li key={person.id}>
  {/* Display the actor's profile image when available. */}
  {person.profile_path && (
    <Image
      // Build the TMDB profile image URL.
      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}

      // Describe whose image this is.
      alt={person.name}

      // Width of the actor's image.
      width={100}

      // Height of the actor's image.
      height={150}
    />
  )}

  {/* Display the actor's name and character. */}
  <p>
    {person.name} as {person.character}
  </p>
</li>
        ))}
      </ul>

      {/* Display similar movies using our reusable MovieGrid. */}
      <h2>Similar Movies</h2>

      <MovieGrid movies={similar.results.slice(0, 6)} />
    </main>
  );
}