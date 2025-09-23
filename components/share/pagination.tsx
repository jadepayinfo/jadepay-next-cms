import { cn } from '@/lib/css';
import { HTMLAttributes } from 'react';

interface PaginationType extends HTMLAttributes<HTMLDivElement> {
  count: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = (props: PaginationType) => {
  const { count, currentPage, onPageChange } = props;
  let pages = [];
  for (let i = 0; i < count; i++) {
    pages.push(i + 1);
  }

  if (pages.length > 7) {
    if (currentPage > 2 && currentPage < count - 2) {
      if (currentPage === 3) pages = [1, '..', 3, 4, 5, '..', count];
      else if (currentPage === count - 3)
        pages = [1, '..', count - 5, count - 4, count - 3, '..', count];
      else
        pages = [
          1,
          '..',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '..',
          count
        ];
    } else {
      pages = [
        ...pages.filter((a) => a < 4),
        '..',
        ...pages.filter((a) => a > count - 3)
      ];
    }
  }

  return (
    <div className={cn('pagination mt-5', props.className)}>
      {currentPage !== 1 ? (
        <div
          className="item"
          onClick={() => onPageChange(currentPage - 1)}
        >{`<`}</div>
      ) : (
        // <div className="item item--disable">{`<`}</div>
        null
      )}
      {pages.map((page, i) =>
        typeof page === 'number' ? (
          <div
            key={i}
            onClick={() => page != currentPage && onPageChange(page)}
            className={`item ${
              typeof page == 'number' && currentPage === page
                ? 'item--active'
                : ''
            }`}
          >
            {page}
          </div>
        ) : (
          <div key={i} className="item">
            ..
          </div>
        )
      )}
      {currentPage !== count ? (
        <div
          className="item"
          onClick={() => onPageChange(currentPage + 1)}
        >{`>`}</div>
      ) : (
        // <div className="item item--disable">{`>`}</div>
        null
      )}
    </div>
  );
};

export default Pagination;
