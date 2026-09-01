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

  // The movie's popularity score (present on detail responses).
  popularity?: number;

  // The movie's runtime in minutes (present on detail responses).
  runtime?: number;

  // Full genre objects from the movie-details endpoint.
  genres?: Genre[];

  // Genre ids from list/search endpoints.
  genre_ids?: number[];
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

// Describes one video (trailer, teaser, clip, etc.) attached to a movie.
export type MovieVideo = {
  // TMDB's own id for this video entry.
  id: string;

  // The video's title, e.g. "Official Trailer".
  name: string;

  // Which platform hosts it — we only care about "YouTube" here, since
  // that's the only site we know how to embed.
  site: string;

  // The id YouTube needs to embed/play this video (used to build the
  // embed URL: https://www.youtube.com/embed/{key}).
  key: string;

  // What kind of video this is — "Trailer", "Teaser", "Clip", etc.
  type: string;
};

// Describes the response we get from TMDB's videos endpoint.
export type MovieVideosResponse = {
  // The movie's id these videos belong to.
  id: number;

  // The list of videos TMDB has for this movie.
  results: MovieVideo[];
};
