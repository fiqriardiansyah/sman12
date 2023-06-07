import { Transfer, TransferProps } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";
import { TransferItem } from "antd/es/transfer";
import difference from "lodash/difference";

interface TableTransferProps extends TransferProps<TransferItem> {
    dataSource: any[];
    leftColumns: ColumnsType<any>;
    rightColumns: ColumnsType<any>;
}

function TableTransfer({ leftColumns, rightColumns, ...restProps }: TableTransferProps) {
    return (
        <Transfer {...restProps}>
            {({ direction, filteredItems, onItemSelectAll, onItemSelect, selectedKeys: listSelectedKeys, disabled: listDisabled }) => {
                const columns = direction === "left" ? leftColumns : rightColumns;

                const rowSelection: TableRowSelection<TransferItem> = {
                    getCheckboxProps: (item) => ({ disabled: listDisabled || item.disabled }),
                    onSelectAll(selected, selectedRows) {
                        const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key);
                        const diffKeys = selected ? difference(treeSelectedKeys, listSelectedKeys) : difference(listSelectedKeys, treeSelectedKeys);
                        onItemSelectAll(diffKeys as string[], selected);
                    },
                    onSelect({ key }, selected) {
                        onItemSelect(key as string, selected);
                    },
                    selectedRowKeys: listSelectedKeys,
                };

                return (
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredItems}
                        size="small"
                        style={{ pointerEvents: listDisabled ? "none" : undefined }}
                        onRow={({ key, disabled: itemDisabled }) => ({
                            onClick: () => {
                                if (itemDisabled || listDisabled) return;
                                onItemSelect(key as string, !listSelectedKeys.includes(key as string));
                            },
                        })}
                    />
                );
            }}
        </Transfer>
    );
}

export default TableTransfer;
