/*
 * OpenFaces - JSF Component Library 2.0
 * Copyright (C) 2007-2011, TeamDev Ltd.
 * licensing@openfaces.org
 * Unless agreed in writing the contents of this file are subject to
 * the GNU Lesser General Public License Version 2.1 (the "LGPL" License).
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please visit http://openfaces.org/licensing/ for more details.
 */
package org.openfaces.renderkit.table;

import org.openfaces.component.table.BaseColumn;
import org.openfaces.component.table.DataTable;
import org.openfaces.component.table.GroupingRule;
import org.openfaces.renderkit.RendererBase;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Set;

public class RowGroupingRenderer extends RendererBase {
    @Override
    public void encodeBegin(FacesContext context, UIComponent component) throws IOException {
        super.encodeBegin(context, component);

        UIComponent parent = component.getParent();
        if (!(parent instanceof DataTable))
            throw new IllegalStateException("<o:columnResizing> can only be placed as a child component inside of " +
                    "a <o:dataTable> component. Though the following parent component has been encountered: " +
                    parent.getClass().getName());
        DataTable table = (DataTable) component.getParent();

        TableStructure tableStructure = TableStructure.getCurrentInstance(table);
        Set<BaseColumn> columns = new LinkedHashSet<BaseColumn>(tableStructure.getColumns());
        for (GroupingRule groupingRule : table.getGroupingRules()) {
            String columnId = groupingRule.getColumnId();
            BaseColumn column = table.getColumnById(columnId);
            columns.add(column);
        }



    }
}