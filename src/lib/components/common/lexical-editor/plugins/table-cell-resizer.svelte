<script lang="ts">
	import {
		$getTableNodeFromLexicalNodeOrThrow as getTableNodeFromLexicalNodeOrThrow,
		getDOMCellFromTarget,
		getTableElement,
		TableNode,
		type TableDOMCell,
		$isTableCellNode as isTableCellNode,
		$computeTableMapSkipCellCheck as computeTableMapSkipCellCheck,
		TableCellNode,
		type TableMapType,
		$getTableRowIndexFromTableCellNode as getTableRowIndexFromTableCellNode,
		$isTableRowNode as isTableRowNode
	} from '@lexical/table';
	import { calculateZoomLevel, isHTMLElement } from '@lexical/utils';
	import {
		$getNearestNodeFromDOMNode as getNearestNodeFromDOMNode,
		type LexicalEditor
	} from 'lexical';
	import { convertObjectToCssStyles } from './consts';

	type Props = {
		editor: LexicalEditor;
	};

	let { editor }: Props = $props();

	type MousePosition = {
		x: number;
		y: number;
	};

	const MIN_ROW_HEIGHT = 33;
	const MIN_COLUMN_WIDTH = 92;

	type MouseDraggingDirection = 'right' | 'bottom';

	let targetRef = $state<HTMLElement | null>(null);
	let resizerRef = $state<HTMLDivElement | null>(null);
	let tableRectRef = $state<ClientRect | null>(null);
	let mouseStartPosRef = $state.raw<MousePosition | null>(null);
	let mouseCurrentPos = $state.raw<MousePosition | null>(null);
	let activeCell = $state<TableDOMCell | null>(null);
	let isMouseDown = $state(false);
	let draggingDirection = $state<MouseDraggingDirection | null>(null);

	let isHeightChanging = (dir: MouseDraggingDirection) => {
		return dir === 'bottom';
	};

	const isMouseDownOnEvent = (event: MouseEvent) => {
		return (event.buttons & 1) === 1;
	};

	let resizerStyles = $derived.by(() => {
		if (!activeCell) return { bottom: '', right: '' };

		const { height, width, top, left } = activeCell.elem.getBoundingClientRect();
		const zoom = calculateZoomLevel(activeCell.elem);
		const zoneWidth = 10;

		const styles: Record<MouseDraggingDirection, Record<string, string>> = {
			bottom: {
				cursor: 'row-resize',
				height: `${zoneWidth}px`,
				left: `${window.scrollX + left}px`,
				top: `${window.scrollY + top + height - zoneWidth / 2}px`,
				width: `${width}px`,
				'background-color': 'none'
			},
			right: {
				cursor: 'col-resize',
				height: `${height}px`,
				left: `${window.scrollX + left + width - zoneWidth / 2}px`,
				top: `${window.scrollY + top}px`,
				width: `${zoneWidth}px`,
				'background-color': 'none'
			}
		};

		if (draggingDirection && mouseCurrentPos && tableRectRef) {
			if (isHeightChanging(draggingDirection)) {
				styles[draggingDirection].left = `${window.scrollX + tableRectRef.left}px`;
				styles[draggingDirection].top = `${window.scrollY + mouseCurrentPos.y / zoom}px`;
				styles[draggingDirection].height = '3px';
				styles[draggingDirection].width = `${tableRectRef.width}px`;
			} else {
				styles[draggingDirection].left = `${window.scrollX + mouseCurrentPos.x / zoom}px`;
				styles[draggingDirection].top = `${window.scrollY + tableRectRef.top}px`;
				styles[draggingDirection].height = `${tableRectRef.height}px`;
				styles[draggingDirection].width = `3px`;
			}
		}

		return {
			bottom: convertObjectToCssStyles(styles.bottom),
			right: convertObjectToCssStyles(styles.right)
		};
	});

	const toggleResize = (direction: MouseDraggingDirection) => (evt: MouseEvent) => {
		evt.preventDefault();
		evt.stopPropagation();

		if (!activeCell) throw new Error('TableCellResizer: Expected active cell.');

		mouseStartPosRef = {
			x: evt.clientX,
			y: evt.clientY
		};
		mouseCurrentPos = mouseStartPosRef;
		draggingDirection = direction;

		document.addEventListener('mouseup', mouseUpHandler(direction));
	};

	const resetState = () => {
		activeCell = null;
		targetRef = null;
		draggingDirection = null;
		mouseStartPosRef = null;
		tableRectRef = null;
	};

	const onMouseMove = (event: MouseEvent) => {
		const target = event.target;
		if (!isHTMLElement(target)) {
			return;
		}

		if (draggingDirection) {
			mouseCurrentPos = {
				x: event.clientX,
				y: event.clientY
			};
			return;
		}
		isMouseDown = isMouseDownOnEvent(event);
		if (resizerRef && resizerRef.contains(target)) {
			return;
		}

		if (targetRef !== target) {
			targetRef = target;
			const cell = getDOMCellFromTarget(target);

			if (cell && activeCell !== cell) {
				editor.getEditorState().read(
					() => {
						const tableCellNode = getNearestNodeFromDOMNode(cell.elem);
						if (!tableCellNode) {
							throw new Error('TableCellResizer: Table cell node not found.');
						}

						const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
						const tableElement = getTableElement(
							tableNode,
							editor.getElementByKey(tableNode.getKey())
						);

						if (!tableElement) {
							throw new Error('TableCellResizer: Table element not found.');
						}

						targetRef = target as HTMLElement;
						tableRectRef = tableElement.getBoundingClientRect();
						activeCell = cell;
					},
					{ editor }
				);
			} else if (cell == null) {
				resetState();
			}
		}
	};

	const getCellColumnIndex = (tableCellNode: TableCellNode, tableMap: TableMapType) => {
		for (let row = 0; row < tableMap.length; row++) {
			for (let column = 0; column < tableMap[row].length; column++) {
				if (tableMap[row][column].cell === tableCellNode) {
					return column;
				}
			}
		}
	};

	const getCellNodeHeight = (
		cell: TableCellNode,
		activeEditor: LexicalEditor
	): number | undefined => {
		const domCellNode = activeEditor.getElementByKey(cell.getKey());
		return domCellNode?.clientHeight;
	};

	const updateRowHeight = (heightChange: number) => {
		if (!activeCell) throw new Error('TableCellResizer: Expected active cell.');

		editor.update(
			() => {
				const tableCellNode = getNearestNodeFromDOMNode(activeCell!.elem);
				if (!isTableCellNode(tableCellNode)) {
					throw new Error('TableCellResizer: Table cell node not found.');
				}

				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);

				const tableRowIndex =
					getTableRowIndexFromTableCellNode(tableCellNode) + tableCellNode.getRowSpan() - 1;

				const tableRows = tableNode.getChildren();

				if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
					throw new Error('Expected table cell to be inside of table row.');
				}

				const tableRow = tableRows[tableRowIndex];

				if (!isTableRowNode(tableRow)) {
					throw new Error('Expected table row');
				}

				let height = tableRow.getHeight();
				if (height === undefined) {
					const rowCells = tableRow.getChildren<TableCellNode>();
					height = Math.min(...rowCells.map((cell) => getCellNodeHeight(cell, editor) ?? Infinity));
				}

				const newHeight = Math.max(height + heightChange, MIN_ROW_HEIGHT);
				tableRow.setHeight(newHeight);
			},
			{ tag: 'skip-scroll-into-view' }
		);
	};

	const updateColumnWidth = (widthChange: number) => {
		if (!activeCell) throw new Error('TableCellResizer: Expected active cell.');

		editor.update(
			() => {
				const tableCellNode = getNearestNodeFromDOMNode(activeCell!.elem);
				if (!isTableCellNode(tableCellNode)) {
					throw new Error('TableCellResizer: Table cell node not found.');
				}

				const tableNode = getTableNodeFromLexicalNodeOrThrow(tableCellNode);
				const [tableMap] = computeTableMapSkipCellCheck(tableNode, null, null);
				const columnIndex = getCellColumnIndex(tableCellNode, tableMap);
				if (columnIndex === undefined) {
					throw new Error('TableCellResizer: Table column not found.');
				}

				const colWidths = tableNode.getColWidths();
				if (!colWidths) {
					return;
				}
				const width = colWidths[columnIndex];
				if (width === undefined) {
					return;
				}
				const newColWidths = [...colWidths];
				const newWidth = Math.max(width + widthChange, MIN_COLUMN_WIDTH);
				newColWidths[columnIndex] = newWidth;
				tableNode.setColWidths(newColWidths);
			},
			{ tag: 'skip-scroll-into-view' }
		);
	};

	const mouseUpHandler = (direction: MouseDraggingDirection) => {
		const handler = (evt: MouseEvent) => {
			evt.preventDefault();
			evt.stopPropagation();

			if (!activeCell) throw new Error('TableCellResizer: Expected active cell.');

			if (!mouseStartPosRef) return;

			const { x, y } = mouseStartPosRef;
			if (!activeCell) {
				return;
			}

			const zoom = calculateZoomLevel(evt.target as Element);
			if (isHeightChanging(direction)) {
				const heightChange = (evt.clientY - y) / zoom;
				updateRowHeight(heightChange);
			} else {
				const widthChange = (evt.clientX - x) / zoom;
				updateColumnWidth(widthChange);
			}

			resetState();
			document.removeEventListener('mouseup', handler);
		};

		return handler;
	};

	const onMouseDown = (event: MouseEvent) => {
		isMouseDown = true;
	};

	const onMouseUp = (event: MouseEvent) => {
		isMouseDown = false;
	};

	$effect(() => {
		return editor.registerNodeTransform(TableNode, (tableNode) => {
			if (tableNode.getColWidths()) {
				return tableNode;
			}

			const numCols = tableNode.getColumnCount();
			const columnWidth = MIN_COLUMN_WIDTH;

			tableNode.setColWidths(Array(numCols).fill(columnWidth));
			return tableNode;
		});
	});

	$effect(() => {
		return editor.registerRootListener((rootElement, prevRootElement) => {
			prevRootElement?.removeEventListener('mousemove', onMouseMove);
			prevRootElement?.removeEventListener('mousedown', onMouseDown);
			prevRootElement?.removeEventListener('mouseup', onMouseUp);
			rootElement?.addEventListener('mousemove', onMouseMove);
			rootElement?.addEventListener('mousedown', onMouseDown);
			rootElement?.addEventListener('mouseup', onMouseUp);
		});
	});
</script>

<div bind:this={resizerRef}>
	{#if activeCell && !isMouseDown}
		<div
			class="TableCellResizer__resizer TableCellResizer__ui"
			onmousedown={toggleResize('right')}
			style={resizerStyles.right}
			role="button"
			tabindex="-1"
		></div>
		<div
			onmousedown={toggleResize('right')}
			class="TableCellResizer__resizer TableCellResizer__ui"
			style={resizerStyles.bottom}
			role="button"
			tabindex="-1"
		></div>
	{/if}
</div>
