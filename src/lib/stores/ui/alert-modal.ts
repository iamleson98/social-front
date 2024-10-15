import type { Snippet } from 'svelte';
import { writable } from 'svelte/store';

export type AlertActionFlowState = {
	content: Snippet | string;
	onOk: () => void;
	onCancel: () => void;
};

export const newAlertModalStore = () => {
	const _store = writable<AlertActionFlowState | null>(null);

	const openAlertModal = async ({ content, onOk, onCancel }: AlertActionFlowState) => {
		const newAction: AlertActionFlowState = {
			content,
			onOk: () => {
				onOk();
				_store.set(null);
			},
			onCancel: () => {
				onCancel();
				_store.set(null);
			}
		};
		_store.set(newAction);
	};

	return {
		openAlertModal,
		subscribe: _store.subscribe
	};
};

export const alertStore = newAlertModalStore();
