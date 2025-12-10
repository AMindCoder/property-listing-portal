export interface ServiceCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceCategoryWithCount extends ServiceCategory {
    _count?: {
        galleryItems: number;
    };
}

export interface GalleryItem {
    id: string;
    categoryId: string;
    title: string;
    description: string | null;
    imageUrl: string;
    imageThumbnailUrl: string | null;
    imageAltText: string | null;
    displayOrder: number;
    isActive: boolean;
    projectName: string | null;
    projectLocation: string | null;
    completionDate: Date | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GalleryItemWithCategory extends GalleryItem {
    category: ServiceCategory;
}

export interface CategoryWithGallery extends ServiceCategory {
    galleryItems: GalleryItem[];
}

export interface CreateGalleryItemInput {
    categoryId: string;
    title: string;
    description?: string;
    imageUrl: string;
    imageThumbnailUrl?: string;
    imageAltText?: string;
    projectName?: string;
    projectLocation?: string;
    completionDate?: Date;
    tags?: string[];
}

export interface UpdateGalleryItemInput {
    title?: string;
    description?: string;
    imageUrl?: string;
    imageThumbnailUrl?: string;
    imageAltText?: string;
    projectName?: string;
    projectLocation?: string;
    completionDate?: Date;
    tags?: string[];
    isActive?: boolean;
}

export interface UpdateCategoryInput {
    name?: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    coverImageUrl?: string;
    isActive?: boolean;
}
