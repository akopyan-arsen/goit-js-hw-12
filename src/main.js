import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { searchImages } from './js/pixabay-api.js';
import { hideLoader } from './js/pixabay-api.js';
import { createMarkup } from './js/render-functions.js';

const form = document.querySelector('.form');
const input = document.querySelector('.searchInput');
const list = document.querySelector('.list');
const submitBtn = document.querySelector('.submitBtn');
const loadMore = document.querySelector('.loadMore');
const page = { currentPage: 1 };

submitBtn.disabled = true;

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? data : null;
}
input.addEventListener('input', () => {
  if (input.value.trim() !== '') {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
});

form.addEventListener('submit', handleClick);
loadMore.addEventListener('click', loadClick);

async function handleClick(event) {
  event.preventDefault();
  const searchInputValue = input.value.trim();
  page.currentPage = 1;
  if (searchInputValue !== '') {
    list.innerHTML = '';
    loadMore.classList.add('visually-hidden');
    saveToLocalStorage('searchInputValue', searchInputValue);
    try {
      const response = await searchImages(searchInputValue, page);
      if (response.data.hits.length === 0) {
        hideLoader();
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight',
          backgroundColor: '#EF4040',
          messageColor: '#fff',
          timeout: 3000,
        });
      } else {
        hideLoader();
        list.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));
        lightbox.refresh();
        const checkImagesInterval = setInterval(() => {
          const images = list.querySelectorAll('img');
          const allImagesLoaded = [...images].every(img => img.complete);
          if (allImagesLoaded) {
            clearInterval(checkImagesInterval);
            const totalPages = Math.ceil(
              response.data.totalHits / response.config.params.per_page
            );
            if (response.config.params.page >= totalPages) {
              return iziToast.warning({
                position: 'topRight',
                backgroundColor: '#00A36C',
                message:
                  "We're sorry, but you've reached the end of search results.",
              });
            } else {
              loadMore.classList.remove('visually-hidden');
            }
          }
        }, 50);
      }
      form.reset();
      submitBtn.disabled = true;
    } catch (error) {
      hideLoader();
      iziToast.error({
        message: `${error}`,
        position: 'topRight',
        backgroundColor: '#EF4040',
        messageColor: '#fff',
        timeout: 3000,
      });
    }
  }
}

async function loadClick() {
  loadMore.classList.add('visually-hidden');
  const searchInputValue = getFromLocalStorage('searchInputValue');
  try {
    const response = await searchImages(searchInputValue, page);
    console.log(response);
    const totalPages = Math.ceil(
      response.data.totalHits / response.config.params.per_page
    );
    hideLoader();
    list.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));
    lightbox.refresh();
    scroll();
    const checkImagesInterval = setInterval(() => {
      const images = list.querySelectorAll('img');
      const allImagesLoaded = [...images].every(img => img.complete);
      if (allImagesLoaded) {
        clearInterval(checkImagesInterval);
        if (response.config.params.page >= totalPages) {
          loadMore.classList.add('visually-hidden');
          return iziToast.warning({
            position: 'topRight',
            backgroundColor: '#00A36C',
            message:
              "We're sorry, but you've reached the end of search results.",
          });
        }
      } else {
        loadMore.classList.remove('visually-hidden');
      }
    }, 50);
  } catch (error) {
    console.log(error);
    hideLoader();
    iziToast.error({
      message: `${error}`,
      position: 'topRight',
      backgroundColor: '#EF4040',
      messageColor: '#fff',
      timeout: 3000,
    });
  }
}
function scroll() {
  const card = list.firstElementChild;
  const height = card.getBoundingClientRect().height;
  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}

const lightbox = new SimpleLightbox('.list a', {
  captionsData: 'alt',
  captionDelay: 250,
});
