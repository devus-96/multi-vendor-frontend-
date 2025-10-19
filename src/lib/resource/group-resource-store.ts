import { useLoading } from '@/hooks/use-interact';
import { create } from 'zustand';
import { apiClient } from '../http';
import { createPrimitive, destroyPrimitive, loadingKey, updatePrimitive, withLoading } from './primitives';
import { BaseGroupedResourceStore, ID, Operation } from './type';

export const initGroupedResourceStore = <T>(index: string, set: any, get: any): BaseGroupedResourceStore<T> => {
    return {
        groupId: 'group_id',
        pagination: {},
        items: {},

        fetchGrouped: (params: any) => {
            return apiClient()
                .get(`grouped-${index}`, { params })
                .then((res) => {
                    set(() => {
                        return { items: res.data };
                    });
                    return Promise.resolve(res.data);
                });
        },

        // We not group paginated data.
        fetch: (params: any) => {
            return apiClient()
                .get(`${index}`, { params })
                .then((res) => {
                    const key = get().groupId;
                    const grouped = res.data.reduce((acc: any, item: any) => {
                        const groupKey = item[key];
                        if (!acc[groupKey]) {
                            acc[groupKey] = [];
                        }
                        acc[groupKey].push(item);
                        return acc;
                    }, {});
                    get().setItems(grouped);

                    return Promise.resolve(res.data);
                });
        },

        transform: (item: T) => ({
            ...item,
            groupId: (item as any)[get().groupId],
        }),

        getGroupId: (item: Partial<T>) => {
            return (item as any)[get().groupId];
        },

        setCurrent: (inputs: Partial<T> | undefined) =>
            set((state: any) => ({
                current:
                    inputs == undefined
                        ? undefined
                        : get().transform({
                              ...state.current,
                              ...inputs,
                          }),
            })),

        setItems: (items: Record<ID, T[]>) => {
            set(() => ({
                items: Object.fromEntries(
                    Object.entries(items).map(([groupId, groupItems]) => {
                        return [
                            groupId,
                            groupItems.map((item) => {
                                return get().transform(item);
                            }),
                        ];
                    }),
                ),
            }));
        },

        setGroup: (groupId: ID, inputs: T[]) => {
            set((state: any) => ({
                items: {
                    ...state.items,
                    [groupId]: inputs.map((item) => get().transform(item)),
                },
            }));
        },

        add: (input: T, firstPosition = true) => {
            const groupedItem = get().transform(input);

            set((state: any) => {
                const group = state.items[groupedItem.groupId] || [];
                return {
                    items: {
                        ...state.items,
                        [groupedItem.groupId]: firstPosition ? [groupedItem, ...group] : [...group, groupedItem],
                    },
                };
            });
        },

        filter: (groupId: ID, predicate: (item: T, index?: number) => boolean) =>
            set((state: any) => ({
                items: {
                    ...state.items,
                    [groupId]: (state.items[groupId] || []).filter(predicate),
                },
            })),

        remove: (groupId: ID, index: number) => {
            get().filter(groupId, (_: T, i: number) => i != index);
        },

        sync: (data: Partial<T>, predicate: (item: T) => boolean) => {
            const { transform, groupId } = get();
            const groupIdValue = (data as any)[groupId];
            set((state: any) => ({
                items: {
                    ...state.items,
                    [groupIdValue]: (state.items[groupIdValue] || []).map((item: T) => (predicate(item) ? transform({ ...item, ...data }) : item)),
                },
            }));
        },

        syncWithId: (data: Partial<T>) => {
            get().sync(data, (item: T) => (item as any).id == (data as any).id);
        },

        create: (data: Partial<T> | FormData, options?: any) => {
            const sync = options?.sync !== false;

            // Tranform we add the groupId to the item.
            const { getGroupId } = get();

            return withLoading(`create_${index}`, async () => {
                const created = await createPrimitive<T>({ index, data, options });

                if (sync) {
                    const addFirst = options?.addFirst === true;
                    set((state: any) => {
                        const group = state.items[getGroupId(data)] || [];
                        return {
                            items: {
                                ...state.items,
                                [getGroupId(data)]: addFirst ? [created, ...group] : [...group, created],
                            },
                        };
                    });
                }

                return created;
            });
        },

        update: (id: ID, data: Partial<T> | FormData, options?: any) => {
            return withLoading(`update_${index}_${id}`, async () => {
                const updated = await updatePrimitive<T>({ index, id, data, options });
                if (options?.sync !== false) get().syncWithId(updated);
                return updated;
            });
        },

        destroy: (groupId: ID, id: ID, options?: any) => {
            const sync = options?.sync !== false;

            return withLoading(`destroy_${index}_${id}`, async () => {
                const deleted = await destroyPrimitive({ index, id, options });

                if (sync) {
                    set((state: any) => ({
                        items: {
                            ...state.items,
                            [groupId]: (state.items[groupId] || []).filter((item: T) => (item as any).id !== id),
                        },
                    }));
                }

                return deleted;
            });
        },

        loading: (operation: Operation, id?: ID) => {
            return useLoading.getState().status[loadingKey(operation, index, id)];
        },

        updateCurrent: (data: Partial<T>, options?: any) => {
            const current = get().current;
            if (!current) {
                return Promise.reject('No current element selected.');
            }
            return get().update(current.groupId, current.id, data, options);
        },

        destroyCurrent: (options?: any) => {
            const current = get().current;
            if (!current) {
                return Promise.reject('No current element selected.');
            }

            return get().destroy(current.groupId, current.id, options);
        },

        loadingCurrent: (operation: Operation) => {
            const current = get().current;
            if (!current) {
                return false;
            } else {
                return useLoading.getState().status[loadingKey(operation, index, current.id)];
            }
        },
    };
};

export const createGroupedResourceStore = <T, S = {}>(index: string, stateSlice?: (set: any, get: any) => S) => {
    return create<BaseGroupedResourceStore<T> & S>((set, get) => ({
        ...initGroupedResourceStore<T>(index, set, get),
        ...(stateSlice ? stateSlice(set, get) : ({} as S)),
    }));
};
