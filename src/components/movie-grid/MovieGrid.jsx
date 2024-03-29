import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useParams } from "react-router";

import "./movie-grid.scss";

import MovieCard from "../movie-card/MovieCard";
import Button, { OutlineButton } from "../button/Button";
import Input from "../input/Input";

import tmdbApi, { category, movieType, tvType } from "../../api/tmdbApi";
import Genres from "./Genres";
import useGenre from "./useGenre";
import { useLocation } from "react-router-dom";

const MovieGrid = (props) => {
  console.log(props);
  // const [items, setItems] = useState([]);

  // const [page, setPage] = useState(1);
  // const [totalPage, setTotalPage] = useState(0);

  // const { keyword } = useParams();
  const location = useLocation();
  console.log(location);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const type = location.pathname === "/movie" ? "movie" : "tv";
  const genreforURL = useGenre(selectedGenres);

  console.log(props.category);
  const [items, setItems] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  const { keyword } = useParams();

  useEffect(() => {
    const getList = async () => {
      let response = null;
      if (keyword === undefined) {
        const params = {
          with_genres: genreforURL,
          sort_by: "popularity.desc",
          include_video: false,
        };
        switch (props.category) {
          case category.movie:
            response = await tmdbApi.discoverMoviesList({
              params,
            });
            console.log(response);
            break;
          default:
            response = await tmdbApi.getTvList(tvType.popular, { params });
        }
      } else {
        const params = {
          query: keyword,
        };
        response = await tmdbApi.search(props.category, { params });
      }
      setItems(response.results);
      setTotalPage(response.total_pages);
    };
    getList();
  }, [props.category, keyword, genreforURL]);

  const loadMore = async () => {
    let response = null;
    if (keyword === undefined) {
      const params = {
        // page: page + 1,
        with_genres: genreforURL,
        page: page + 1,
      };
      switch (props.category) {
        case category.movie:
          response = await tmdbApi.discoverMoviesList({
            params,
          });
          break;
        default:
          response = await tmdbApi.getTvList(tvType.popular, { params });
      }
    } else {
      const params = {
        page: page + 1,
        query: keyword,
      };
      response = await tmdbApi.search(props.category, { params });
    }
    setItems([...items, ...response.results]);
    setPage(page + 1);
  };
  console.log(items);

  return (
    <>
      <div>
        <Genres
          type={type}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          genres={genres}
          setGenres={setGenres}
          setPage={setPage}
        />
      </div>
      <div className="section mb-3">
        <MovieSearch category={props.category} keyword={keyword} />
      </div>
      <div className="movie-grid">
        {items.map((item, i) => (
          <MovieCard category={props.category} item={item} key={i} />
        ))}
      </div>
      {page < totalPage ? (
        <div className="movie-grid__loadmore">
          <OutlineButton className="small" onClick={loadMore}>
            Load more
          </OutlineButton>
        </div>
      ) : null}
    </>
  );
};

const MovieSearch = (props) => {
  console.log(props);
  const history = useHistory();

  const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");

  const goToSearch = useCallback(() => {
    if (keyword.trim().length > 0) {
      history.push(`/${category[props.category]}/search/${keyword}`);
    }
  }, [keyword, props.category, history]);

  useEffect(() => {
    const enterEvent = (e) => {
      e.preventDefault();
      if (e.keyCode === 13) {
        goToSearch();
      }
    };
    document.addEventListener("keyup", enterEvent);
    return () => {
      document.removeEventListener("keyup", enterEvent);
    };
  }, [keyword, goToSearch]);

  return (
    <div className="movie-search">
      <Input
        type="text"
        placeholder="Enter keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Button className="small" onClick={goToSearch}>
        Search
      </Button>
    </div>
  );
};

export default MovieGrid;
