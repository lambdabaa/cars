// @flow

type Elementish = HTMLElement | string;

function getTextContent(doc: HTMLElement, target: Elementish): ?string {
  const element = getElement(doc, target);
  if (!element) {
    return null;
  }

  return element.textContent;
}

function getElement(doc: HTMLElement, target: Elementish): HTMLElement {
  if (typeof target !== 'string') {
    return target;
  }

  return doc.querySelector(target);
}

exports.getTextContent = getTextContent;
