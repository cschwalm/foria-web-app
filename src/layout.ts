export enum Layout {
  Mobile,
  Desktop
}

export const getLayout = () =>
  window.innerWidth < 700 ? Layout.Mobile : Layout.Desktop;

export const byLayout = (layout: Layout) => (a: any, b: any) =>
  layout === Layout.Mobile ? a : b;
