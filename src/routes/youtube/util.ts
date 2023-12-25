export const sliceTextToFront = (text: string, sliceText: string) => {
  return text.slice(text.indexOf(sliceText) + sliceText.length, text.length);
};

export const sliceTextToBack = (text: any, sliceText: any) => {
  return text.slice(text, text.indexOf(sliceText));
};

export const jsonToCsv = (jsonData: any) => {
  const jsonArray = jsonData;

  let csvString = "";

  const titles = Object.keys(jsonArray[0]);

  titles.forEach((title, index) => {
    csvString += index !== titles.length - 1 ? `${title},` : `${title}\r\n`;
  });
  jsonArray.forEach((content: any, index: number) => {
    let row = "";
    for (let title in content) {
      row += row === "" ? `${content[title]}` : `,${content[title]}`;
    }
    csvString += index !== jsonArray.length - 1 ? `${row}\r\n` : `${row}`;
  });
  return csvString;
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
