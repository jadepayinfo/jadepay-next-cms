export const getCountPage = (totalRecords: number | string, maxPage?: number) => {
    let currentMaxPage = maxPage ?? 25;
    let currentTotalRecords = Number(totalRecords);

    let countPage = 0;
    if (currentTotalRecords > 1000) {
        countPage = currentMaxPage;
    } else {
        countPage = Math.ceil(currentTotalRecords / currentMaxPage);
    }
    return countPage;
}