import { createOptimizedPicture } from '../../scripts/aem.js';

async function fetchTopSellers(jsonURL) {
  const response = await fetch(jsonURL);
  const data = await response.json();
  return data.data;
}

function fetchDetails(allUrls) {
  const topSellers = document.createElement('ul');
  topSellers.classList.add('top-sellers-list');

  allUrls.forEach((el) => {
    const urlPath = el.path;
    if (urlPath.includes('/product-details')) {
      const topSellerDetails = document.createElement('li');
      topSellerDetails.classList.add('top-sellers-item');

      const pictureElement = createOptimizedPicture(el.image);
      pictureElement.classList.add('top-sellers-img');

      const titleElement = document.createElement('p');
      titleElement.classList.add('top-sellers-title');
      titleElement.innerHTML = el.title;

      const descriptionElement = document.createElement('p');
      descriptionElement.classList.add('top-sellers-description');
      descriptionElement.innerHTML = el.description;

      const pageUrls = document.createElement('a');
      pageUrls.href = el.path;
      pageUrls.innerHTML = 'Show Details';
      pageUrls.classList.add('page-links');

      const wishListIcon = document.createElement('div');
      wishListIcon.classList.add('wishlist-icon');
      wishListIcon.innerHTML = '\u{2661}';

      topSellerDetails.append(pictureElement);
      topSellerDetails.append(titleElement);
      topSellerDetails.append(descriptionElement);
      topSellerDetails.append(pageUrls);
      topSellerDetails.append(wishListIcon);

      topSellers.appendChild(topSellerDetails);
    }
  });

  return topSellers;
}

function createTopSellerCarousel(items) {
  const topSellerCarouselContainer = document.createElement('div');
  topSellerCarouselContainer.classList.add('top-seller-carousel-container');

  const topSellerCarouselWrapper = document.createElement('div');
  topSellerCarouselWrapper.classList.add('top-seller-carousel-wrapper');
  topSellerCarouselWrapper.appendChild(items);

  const topSellerPrevBtn = document.createElement('button');
  topSellerPrevBtn.classList.add('carousel-button', 'prev');
  topSellerPrevBtn.innerHTML = 'Prev';

  const topSellerNextBtn = document.createElement('button');
  topSellerNextBtn.classList.add('carousel-button', 'next');
  topSellerNextBtn.innerHTML = 'Next';

  const topSellerDotsContainer = document.createElement('div');
  topSellerDotsContainer.classList.add('carousel-dots');

  topSellerCarouselContainer.append(topSellerPrevBtn);
  topSellerCarouselContainer.append(topSellerCarouselWrapper);
  topSellerCarouselContainer.append(topSellerNextBtn);
  topSellerCarouselContainer.append(topSellerDotsContainer);

  let currentPage = 0;
  let itemsPerPage = 2;

  if (window.innerWidth >= 900) {
    itemsPerPage = 5;
  }

  const totalPages = Math.ceil(items.childElementCount / itemsPerPage);

  function updateCarousel() {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    Array.from(items.children).forEach((item, index) => {
      item.style.display = index >= startIndex && index < endIndex ? 'block' : 'none';
    });

    const dots = topSellerDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      if (index === currentPage) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function updateCurrentPage(pageIndex) {
    currentPage = pageIndex;
  }

  function createDots() {
    for (let i = 0; i < totalPages; i += 1) {
      const pageIndex = i;
      const dot = document.createElement('span');
      dot.classList.add('dot');
      dot.addEventListener('click', () => {
        updateCurrentPage(pageIndex);
        updateCarousel();
      });
      topSellerDotsContainer.appendChild(dot);
    }
  }

  createDots();
  updateCarousel();

  topSellerPrevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage -= 1;
      updateCarousel();
    }
  });

  topSellerNextBtn.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage += 1;
      updateCarousel();
    }
  });

  return topSellerCarouselContainer;
}

export default async function decorate(block) {
  const topSellersLinks = block.querySelector('a[href$=".json"]');

  if (topSellersLinks) {
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('top-sellers-div');

    const allUrls = await fetchTopSellers(topSellersLinks.href);
    const allSellers = fetchDetails(allUrls);

    const carousel = createTopSellerCarousel(allSellers);
    mainDiv.appendChild(carousel);

    topSellersLinks.replaceWith(mainDiv);
  }
}
