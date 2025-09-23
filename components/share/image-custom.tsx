import { cn } from '@/lib/css';
import { FC, ImgHTMLAttributes, useState } from 'react';
import { AppLogo } from '../layout/app_logo';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  aspect?: string;
}

const ImageCustom: FC<Props> = (props) => {
  const { aspect, ...ImagesProps } = props;

  const hasImage = ImagesProps?.src ? true : false;
  const [loading, setLoading] = useState(hasImage);
  const ImageLoaded = () => setLoading(false);

  const aspectDefault = aspect ? `aspect-[${aspect}]` : 'aspect-[1/1]';

  return (
    <>
      <div
        className={cn(
          ' h-full relative rounded-md',
          aspect && aspectDefault,
          loading && 'animate-pulse bg-primary bg-opacity-20'
        )}
      >
        {loading ? (
          <div className="h-full flex justify-center items-center">
            <span className="loading loading-dots loading-sm text-primary animate-none"></span>
          </div>
        ) : null}
        {hasImage ? (
          <img
            className={cn(
              'h-full drop-shadow-md rounded',
              loading && 'absolute top-0',
              aspect && aspectDefault,
              props.className
            )}
            alt={ImagesProps?.alt}
            src={ImagesProps?.src}
            onLoad={ImageLoaded}
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              'h-full bg-primary bg-opacity-10 text-neutral-content flex justify-center items-center text-5xl drop-shadow-md rounded',
              aspect && aspectDefault
            )}
          >
            <AppLogo />
          </div>
        )}
      </div>
    </>
  );
};

export default ImageCustom;
