import { Plugin, MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian'

// Regular Expression for expression{LHLL} format
const REGEXP = /([^\s<>]+){([hlHL]+)}/g

// Main Tags to search for Furigana Syntax
const TAGS = 'p, h1, h2, h3, h4, h5, h6, ol, ul, table'

const convertPitch = (element: Text): Node => {
	const matches = Array.from(element.textContent.matchAll(REGEXP))
	for (const [_, expression, pitch] of matches) {
		if (expression.length >= pitch.length) {
			let target_str = expression.slice(-pitch.length);
			let high_low = pitch.toLowerCase();
			let resultEl = document.createElement('span');
			[...high_low].forEach((item, index, array) => {
				const cls = (index === 0 || item === array[index - 1])
					? `tone-${item}`
					: `tone-${item}-change`;
					
				resultEl.createEl('span', { cls, text: target_str[index] });
			});

			return resultEl;
		}
	}
	return element
}

export default class MarkdownPitch extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const blockToReplace = el.querySelectorAll(TAGS)
			if (blockToReplace.length === 0) return;

			function replace(node: Node) {
				const childrenToReplace: Text[] = []
				node.childNodes.forEach(child => {
					if (child.nodeType === 3) {
						// Nodes of Type 3 are TextElements
						childrenToReplace.push(child as Text);
					} else if (child.hasChildNodes() && child.nodeName !== 'CODE' && child.nodeName !== 'RUBY') {
						// Ignore content in Code Blocks
						replace(child);
					}
				})

				childrenToReplace.forEach((child) => child.replaceWith(convertPitch(child)));
			}

			blockToReplace.forEach(block => replace(block));
		})
	}
}