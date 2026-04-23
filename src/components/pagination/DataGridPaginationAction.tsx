import { useMemo } from 'react';
import { useGridApiContext, useGridRootProps } from '@mui/x-data-grid';
import CustomTablePaginationAction, {
  CustomTablePaginationActionProps,
} from './CustomTablePaginationAction';

export interface DataGridPaginationActionProps extends CustomTablePaginationActionProps {
  showAllHref?: string;
}

// Safe wrappers that return null instead of throwing when outside a Data Grid
const useSafeGridApiContext = () => {
  try {
    return useGridApiContext();
  } catch {
    return null;
  }
};

const useSafeGridRootProps = () => {
  try {
    return useGridRootProps();
  } catch {
    return null;
  }
};

const DataGridPaginationAction = ({ showAllHref, ...rest }: DataGridPaginationActionProps) => {
  const { page, rowsPerPage, count } = rest;

  const apiRef = useSafeGridApiContext();
  const rootProps = useSafeGridRootProps();
  const isMissingContext = !apiRef || !rootProps;

  const defaultPageSize = useMemo(() => {
    if (isMissingContext) return rowsPerPage;
    // rootProps is guaranteed to exist here because isMissingContext is false
    return (rootProps as any).initialState?.pagination?.paginationModel?.pageSize || rowsPerPage;
  }, [isMissingContext, rootProps, rowsPerPage]);

  const isShowingAll = useMemo(() => rowsPerPage === count, [rowsPerPage, count]);

  const handleNext = () => {
    if (isMissingContext) return;
    (apiRef as any).current.setPage(page + 1);
  };

  const handlePrev = () => {
    if (isMissingContext) return;
    (apiRef as any).current.setPage(page - 1);
  };

  const handleShowAll = () => {
    if (isMissingContext) return;
    if (showAllHref) return;
    if (isShowingAll) {
      (apiRef as any).current.setPageSize(defaultPageSize);
    } else {
      (apiRef as any).current.setPageSize(count);
    }
  };

  return (
    <CustomTablePaginationAction
      onNextClick={isMissingContext ? undefined : handleNext}
      onPrevClick={isMissingContext ? undefined : handlePrev}
      onShowAllClick={isMissingContext ? undefined : handleShowAll}
      showAllHref={showAllHref}
      {...rest}
    />
  );
};

export default DataGridPaginationAction;
