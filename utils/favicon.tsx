export const FaviconUtils = {
  getFaviconLink: (publicationImageUrl: string): JSX.Element | null => {
    if (publicationImageUrl.toLowerCase().indexOf('.jpg') > -1) {
      return <link rel="icon" type='image/jpg' href={publicationImageUrl} />
    }

    if (publicationImageUrl.toLowerCase().indexOf('.png') > -1) {
      return <link rel='icon' type='image/png' href={publicationImageUrl} />
    }

    if (publicationImageUrl.toLowerCase().indexOf('.svg') > -1) {
      return <link rel="icon" type="image/svg+xml" href={publicationImageUrl} />
    }

    if (publicationImageUrl.toLowerCase().indexOf('.ico') > -1) {
      return <link rel='icon' href={publicationImageUrl} />
    }

    return null;
  }
}
