import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Property } from '../../models/property.model';

export interface PropertyState extends EntityState<Property> {
  createdProperty: Property | null;

  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;

  error: string | null;
  createError: string | null;
  updateError: string | null;

  createSuccess: boolean;
  updateSuccess: boolean;
}

export const propertyAdapter = createEntityAdapter<Property>({
  selectId: (property: Property) => property.id
});

export const initialPropertyState: PropertyState = propertyAdapter.getInitialState({
  createdProperty: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
  createError: null,
  updateError: null,
  createSuccess: false,
  updateSuccess: false,
});
