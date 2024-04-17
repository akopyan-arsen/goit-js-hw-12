import axios from 'axios';

const loader = document.querySelector('.loader');
const loader2 = document.querySelector('.loader2');

export function hideLoader() {
  loader.classList.add('visually-hidden');
  loader2.classList.add('visually-hidden');
}

export async function searchImages(searchInput, page) {
  const API_KEY = '43234755-a337228de2a5121df872aa78d';
  if (page.currentPage === 1) {
    loader.classList.remove('visually-hidden');
  } else {
    loader2.classList.remove('visually-hidden');
  }
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: searchInput,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 100,
        page: page.currentPage,
      },
    });

    page.currentPage += 1;
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
}
