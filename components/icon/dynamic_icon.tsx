import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface UseDynamicSVGImportOptions {
  onCompleted?: (
    name: string,
    SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> | undefined
  ) => void;
  onError?: (err: Error) => void;
}

function useDynamicSVGImport(
  name: string,
  options: UseDynamicSVGImportOptions = {}
) {
  const ImportedIconRef = useRef<React.FC<React.SVGProps<SVGSVGElement>> | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;
  useEffect(() => {
    const importIcon = async (): Promise<void> => {
      try {
        setLoading(true);
        ImportedIconRef.current = await dynamic(
          () => import(`@/public/assets/${name}.svg`)
        ) as any;
        onCompleted?.(name, ImportedIconRef.current);
      } catch (err: any) {
        onError?.(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    importIcon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return { error, loading, SvgIcon: ImportedIconRef.current };
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  onCompleted?: () => UseDynamicSVGImportOptions['onCompleted'];
  onError?: () => UseDynamicSVGImportOptions['onError'];
}

/**
 * Simple wrapper for dynamic SVG import hook. You can implement your own wrapper,
 * or even use the hook directly in your components.
 */
export const DynamicIcon: React.FC<IconProps> = ({
  name = 'cycle',
  onCompleted,
  onError,
  ...rest
}): React.ReactNode | null => {
  const { error, loading, SvgIcon } = useDynamicSVGImport(name, {
    onCompleted,
    onError
  });
  // console.log('loading, SvgIcon',loading, SvgIcon)
  if (error) {
    return error.message;
  }
  if (loading) {
    return <span className="loading loading-dots loading-xs"></span>;
  }
  if (SvgIcon) {
    return <SvgIcon {...rest} />;
  }
  return null;
};
