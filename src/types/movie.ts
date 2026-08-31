// export type Movie = {
//   id: number;
//   title: string;
//   overview: string;
//   poster_path: string | null;
//   backdrop_path: string | null;
//   release_date: string;
//   vote_average: number;
// };

// export type MovieResponse = {
//   page: number;
//   results: Movie[];
//   total_pages: number;
//   total_results: number;
// };


export type Movie = {
  // The unique ID of the movie.
  id: number;

  // The movie's title.
  title: string;

  // The movie's description.
  overview: string;

  // Path to the movie poster, or null if there isn't one.
  poster_path: string | null;

  // Path to the movie backdrop, or null if there isn't one.
  backdrop_path: string | null;

  // The movie's release date.
  release_date: string;

  // The movie's average rating.
  vote_average: number;

  // The movie's popularity score.
  popularity: number;

  // The movie's runtime in minutes.
  runtime: number;

  // The movie's genres.
  genres: Genre[];
};

// Describes one movie genre.
export type Genre = {
  // The unique ID of the genre.
  id: number;

  // The genre's name, such as "Action" or "Drama".
  name: string;
};

// Describes a person in the movie's cast.
export type CastMember = {
  // The person's unique ID.
  id: number;

  // The actor's real name.
  name: string;

  // The character they played.
  character: string;

  // Path to their profile image, if available.
  profile_path: string | null;
};

// Describes a person in the movie's crew.
export type CrewMember = {
  // The person's unique ID.
  id: number;

  // The person's name.
  name: string;

  // Their job, such as "Director" or "Writer".
  job: string;
};

// Describes the response we get from TMDB's credits endpoint.
export type MovieCredits = {
  // Array containing the movie's actors.
  cast: CastMember[];

  // Array containing the movie's crew.
  crew: CrewMember[];
};

// Describes the response we get from TMDB when requesting a list of movies.
export type MovieResponse = {
  // The current page number.
  page: number;

  // The movies returned by TMDB.
  results: Movie[];

  // Total number of pages available.
  total_pages: number;

  // Total number of movies available.
  total_results: number;
};
