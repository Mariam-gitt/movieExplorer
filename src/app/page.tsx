
// // import {
// //   getPopularMovies,
// //   getTrendingMovies,
// //   getTopRatedMovies,
// // } from "@/services/movieApi";

// import {
//   getPopularMovies,
//   getTrendingMovies,
//   getTopRatedMovies,
//   getUpcomingMovies,
//   getNowPlayingMovies,
// } from "@/services/movieApi";

// import MovieGrid from "@/components/MovieGrid";

// export default async function Home() {
//   // const popular = await getPopularMovies();
//   // const trending = await getTrendingMovies();
//   // const topRated = await getTopRatedMovies();

//   const popular = await getPopularMovies();
// const trending = await getTrendingMovies();
// const topRated = await getTopRatedMovies();
// const upcoming = await getUpcomingMovies();
// const nowPlaying = await getNowPlayingMovies();

//   return (
//     <main>
//       <section>
//         <h1>Trending Movies</h1>
//         <MovieGrid movies={trending.results} />
//       </section>

//       <section>
//         <h1>Popular Movies</h1>
//         <MovieGrid movies={popular.results} />
//       </section>

//       <section>
//         <h1>Top Rated Movies</h1>
//         <MovieGrid movies={topRated.results} />
//       </section>
//     </main>
//   );
// }

// <section>
//   <h1>Upcoming Movies</h1>
//   <MovieGrid movies={upcoming.results} />
// </section>

// <section>
//   <h1>Now Playing</h1>
//   <MovieGrid movies={nowPlaying.results} />
// </section>


// Next.js Image component.
// It optimizes images and handles image loading for us.
import Image from "next/image";

// Next.js Link component.
// It lets us navigate between pages without a full browser reload.
import Link from "next/link";

// Functions that fetch different categories of movies from TMDB.
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
} from "@/services/movieApi";

// Reusable component that displays a list of movie cards.
import MovieGrid from "@/components/MovieGrid";

// This is our homepage Server Component.
// "async" allows us to use "await" while fetching movie data.
export default async function Home() {
  // Fetch trending movies from TMDB.
  const trending = await getTrendingMovies();

  // Take the first trending movie and use it as our featured movie.
  const featuredMovie = trending.results[0];

  // Fetch popular movies from TMDB.
  const popular = await getPopularMovies();

  // Fetch top-rated movies from TMDB.
  const topRated = await getTopRatedMovies();

  // Fetch upcoming movies from TMDB.
  const upcoming = await getUpcomingMovies();

  // Fetch movies that are currently playing in cinemas.
  const nowPlaying = await getNowPlayingMovies();

  // Return the UI for our homepage.
  return (
    <main>

      {/* Featured movie / Hero section */}
      <section>
        {/* Section heading */}
        <h1>Featured Movie</h1>

        {/* 
          Link makes the featured movie clickable.
          The movie ID is placed into the dynamic URL.
          Example: /movies/550
        */}
        <Link href={`/movies/${featuredMovie.id}`}>

          {/* 
            Only render the image if TMDB provided a poster path.
            This is called conditional rendering.
          */}
          {featuredMovie.poster_path && (
            <Image
              // Build the complete TMDB image URL.
              src={`https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`}

              // Alt text describes the image for accessibility.
              alt={featuredMovie.title}

              // Width of the image.
              width={300}

              // Height of the image.
              height={450}
            />
          )}

          {/* Display the featured movie's title. */}
          <h2>{featuredMovie.title}</h2>

          {/* Display the movie's description. */}
          <p>{featuredMovie.overview}</p>
        </Link>
      </section>

      {/* Trending movies section */}
      <section>
        {/* Section heading */}
        <h1>Trending Movies</h1>

        {/* Send the trending movies to our reusable MovieGrid component. */}
        <MovieGrid movies={trending.results} />
      </section>

      {/* Popular movies section */}
      <section>
        {/* Section heading */}
        <h1>Popular Movies</h1>

        {/* Display the popular movies using MovieGrid. */}
        <MovieGrid movies={popular.results} />
      </section>

      {/* Top-rated movies section */}
      <section>
        {/* Section heading */}
        <h1>Top Rated Movies</h1>

        {/* Display the top-rated movies using MovieGrid. */}
        <MovieGrid movies={topRated.results} />
      </section>

      {/* Upcoming movies section */}
      <section>
        {/* Section heading */}
        <h1>Upcoming Movies</h1>

        {/* Display upcoming movies using MovieGrid. */}
        <MovieGrid movies={upcoming.results} />
      </section>

      {/* Now-playing movies section */}
      <section>
        {/* Section heading */}
        <h1>Now Playing</h1>

        {/* Display movies currently playing using MovieGrid. */}
        <MovieGrid movies={nowPlaying.results} />
      </section>

    </main>
  );
}