import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Loader } from './Loader/Loader';
import { fetchImages } from './api';
import { Modal } from './Modal/Modal';
import { Button } from './Button/Button';
import { useEffect, useState } from 'react';

import 'styles.css';
import toast, { Toaster } from 'react-hot-toast';

export function App() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [largeImageUrl, setLargeImageUrl] = useState('');
  const [showButton, setshowButton] = useState(false);

  const perPage = 12;

  const handleSubmit = event => {
    event.preventDefault();
    let form = event.target;
    let queryElement = form.elements.query;
    if (queryElement.value.length > 0) {
      setImages([]);
      setPage(1);
      setQuery(queryElement.value);
      form.reset();
    }
  };

  const LoadMore = () => {
    setPage(page + 1);
  };

  useEffect(() => {
    // first mount
    if (query.length === 0) return;

    async function loadImages() {
      setLoading(true);
      try {
        const respData = await fetchImages(query, page, perPage);
        if (respData.hits.length === 0){
          toast.error('По вашему запросу ничего не найдено.');
          return;
        }

        const newImages = respData.hits.map(
          ({ id, webformatURL, largeImageURL }) => ({
            id,
            webformatURL,
            largeImageURL,
          })
        );

        const totalHits = page * perPage;
        const showButton = totalHits <= respData.totalHits;
        
        setImages(prevImages => [...prevImages, ...newImages]);
        setshowButton(showButton);
      } catch (error) {
        toast.error('Что-то пошло не так, перегрузите страницу.');
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [page, query]);

  useEffect(() => {
    document.addEventListener('keydown', OnKeyDown);
    return () => {
      document.removeEventListener('keydown', OnKeyDown);
    };
  }, []);

  const OnKeyDown = evt => {
    if (evt.code === 'Escape') {
      setLargeImageUrl('');
    }
  };

  return (
    <div className="App">
      <Searchbar onSubmit={handleSubmit}></Searchbar>

      <Toaster position="top-right" reverseOrder={false} />
      <ImageGallery images={images} onSelect={setLargeImageUrl}></ImageGallery>

      {largeImageUrl.length > 0 && (
        <Modal
          largeImageURL={largeImageUrl}
          setLargeImageUrl={setLargeImageUrl}
        ></Modal>
      )}
      {loading && <Loader></Loader>}
      {images.length > 0 && showButton && <Button onClick={LoadMore}></Button>}
    </div>
  );
}
