'use client';

import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GalleryItem } from '@/types/services';

interface SortableItemProps {
    item: GalleryItem;
}

function SortableItem({ item }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="reorderable-gallery-item"
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}>
                {/* Drag Handle */}
                <div style={{ color: 'var(--text-tertiary)', fontSize: '1.5rem' }}>
                    ⠿
                </div>

                {/* Image */}
                <img
                    src={item.imageUrl}
                    alt={item.imageAltText || item.title}
                    style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                    }}
                />

                {/* Content */}
                <div style={{ flex: 1 }}>
                    <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                    }}>
                        {item.title}
                    </h4>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        Display Order: {item.displayOrder}
                    </p>
                </div>

                {/* Status */}
                <span className={item.isActive ? 'status-available' : 'status-sold'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>
    );
}

interface ReorderableGalleryProps {
    items: GalleryItem[];
    onReorder: (items: GalleryItem[]) => void;
}

export default function ReorderableGallery({ items, onReorder }: ReorderableGalleryProps) {
    const [localItems, setLocalItems] = useState(items);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update display order for all items
                const updatedItems = newItems.map((item, index) => ({
                    ...item,
                    displayOrder: index + 1
                }));

                // Call the parent callback
                onReorder(updatedItems);

                return updatedItems;
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={localItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {localItems.map((item) => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
