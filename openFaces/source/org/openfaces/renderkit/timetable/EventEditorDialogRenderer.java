/*
 * OpenFaces - JSF Component Library 2.0
 * Copyright (C) 2007-2009, TeamDev Ltd.
 * licensing@openfaces.org
 * Unless agreed in writing the contents of this file are subject to
 * the GNU Lesser General Public License Version 2.1 (the "LGPL" License).
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please visit http://openfaces.org/licensing/ for more details.
 */
package org.openfaces.renderkit.timetable;

import org.openfaces.component.input.DateChooser;
import org.openfaces.component.input.DropDownField;
import org.openfaces.component.input.DropDownItem;
import org.openfaces.component.timetable.DayTable;
import org.openfaces.component.timetable.EventEditorDialog;
import org.openfaces.component.timetable.TimetableEditingOptions;
import org.openfaces.component.timetable.TimetableResource;
import org.openfaces.component.window.PopupLayer;
import org.openfaces.renderkit.CompoundComponentRenderer;
import org.openfaces.renderkit.TableRenderer;
import org.openfaces.renderkit.window.WindowRenderer;
import org.openfaces.util.ComponentUtil;
import org.openfaces.util.FunctionCallScript;
import org.openfaces.util.HTML;
import org.openfaces.util.RenderingUtil;
import org.openfaces.util.ScriptBuilder;
import org.openfaces.util.StyleUtil;

import javax.faces.component.UIComponent;
import javax.faces.component.UIInput;
import javax.faces.component.html.HtmlCommandButton;
import javax.faces.component.html.HtmlInputText;
import javax.faces.component.html.HtmlInputTextarea;
import javax.faces.component.html.HtmlPanelGrid;
import javax.faces.component.html.HtmlOutputText;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import java.io.IOException;
import java.util.List;

/**
 * @author Dmitry Pikhulya
 */
public class EventEditorDialogRenderer extends WindowRenderer implements CompoundComponentRenderer {
    public void createSubComponents(FacesContext context, UIComponent component) {
    }

    @Override
    protected String getDefaultClassName() {
        return StyleUtil.mergeClassNames(super.getDefaultClassName(), "o_eventEditorDialog");
    }

    @Override
    protected String getDefaultModalLayerClass() {
        return StyleUtil.mergeClassNames(super.getDefaultModalLayerClass(), "o_eventEditor_modalLayer");
    }

    @Override
    protected String getDefaultContentClass() {
        return StyleUtil.mergeClassNames(super.getDefaultContentClass(), "o_eventEditorDialogContent");
    }

    @Override
    protected void encodeCustomContent(FacesContext context, PopupLayer popupLayer) throws IOException {
        final EventEditorDialog dialog = (EventEditorDialog) popupLayer;
        final DayTable dayTable = (DayTable) dialog.getParent();
        TimetableEditingOptions editingOptions = dayTable.getEditingOptions();
        final boolean useResourceSeparationMode = (Boolean) dayTable.getAttributes().
                get(DayTableRenderer.USE_RESOURCE_SEPARATION_MODE_ATTR) && (editingOptions != null && editingOptions.isEventResourceEditable());
        final boolean eventDurationEditable = (editingOptions != null && editingOptions.isEventDurationEditable());
        final UIComponent[][] components = new UIComponent[][]{
                {
                        createLabelComponent(context, dialog, "nameLabel", dialog.getNameLabel()),
                        getNameField(context, dialog)
                },
                {
                        createLabelComponent(context, dialog, "resourceLabel", dialog.getResourceLabel()),
                        getResourceField(context, dialog)
                },
                {
                        createLabelComponent(context, dialog, "startLabel", dialog.getStartLabel()),
                        createDateTimeFields(context, dialog, "start")
                },
                {
                        createLabelComponent(context, dialog, "endLabel", dialog.getEndLabel()),
                        createDateTimeFields(context, dialog, "end")
                },
                {
                        createLabelComponent(context, dialog, "descriptionLabel", dialog.getDescriptionLabel()),
                },
                {
                        getDescriptionField(context, dialog)
                },
                {
                        null
                }
        };

        new TableRenderer() {

            @Override
            protected void writeTableAttributes(FacesContext context, ResponseWriter writer, UIComponent component) throws IOException {
                super.writeTableAttributes(context, writer, component);
                writer.writeAttribute("class", "o_fullWidthAndHeight", null);
            }

            protected boolean isRowVisible(int rowIndex) {
                switch (rowIndex) {
                    case 1:
                        return useResourceSeparationMode;
                    case 3:
                        return eventDurationEditable;
                    default:
                        return true;
                }
            }

            @Override
            protected void writeRowAttributes(ResponseWriter writer, int rowIndex) throws IOException {
                if (rowIndex == 5) {
                    writer.writeAttribute("style", "height: 100%;", null);
                }
            }

            @Override
            protected void writeCellAttributes(ResponseWriter writer, int rowIndex, int cellIndex) throws IOException {
                super.writeCellAttributes(writer, rowIndex, cellIndex);
                if (rowIndex < 4 && cellIndex == 0)
                    writer.writeAttribute("style", "width: 0", null);
                if (rowIndex == 5)
                    writer.writeAttribute("style", "vertical-align: top;", null);
            }

            @Override
            protected void encodeCellContents(FacesContext context, ResponseWriter writer, UIComponent component, int rowIndex, int colIndex) throws IOException {
                super.encodeCellContents(context, writer, component, rowIndex, colIndex);
                if (rowIndex == components.length - 1) {
                    writer.startElement("div", component);
                    writer.writeAttribute("class", "o_eventEditor_buttonsArea", null);

                    HtmlCommandButton deleteButton = ComponentUtil.createButtonFacet(context, dialog, "deleteButton", dialog.getDeleteButtonText());
                    deleteButton.setStyle(StyleUtil.mergeStyles("float: left", dialog.getDeleteButtonStyle()));
                    deleteButton.setStyleClass(dialog.getDeleteButtonClass());
                    deleteButton.encodeAll(context);

                    HtmlCommandButton okButton = ComponentUtil.createButtonFacet(context, dialog, "okButton", dialog.getOkButtonText());
                    okButton.setStyle(dialog.getOkButtonStyle());
                    okButton.setStyleClass(dialog.getOkButtonClass());
                    okButton.encodeAll(context);
                    HtmlCommandButton cancelButton = ComponentUtil.createButtonFacet(context, dialog, "cancelButton", dialog.getCancelButtonText());
                    writer.write(HTML.NBSP_ENTITY);
                    cancelButton.setStyle(dialog.getCancelButtonStyle());
                    cancelButton.setStyleClass(dialog.getCancelButtonClass());
                    cancelButton.encodeAll(context);
                    writer.endElement("div");

                    RenderingUtil.renderInitScript(context, new ScriptBuilder().functionCall("O$._initEventEditorDialog",
                            dayTable,
                            dialog,
                            dialog.getNewEventCaption(),
                            dialog.getEditEventCaption()).semicolon());
                }
            }

        }.render(popupLayer, components);
    }

    private HtmlOutputText createLabelComponent(FacesContext context, EventEditorDialog dialog, String id, String text) {
        HtmlOutputText outputText = ComponentUtil.composeHtmlOutputText(context, dialog, id, text);
        outputText.setStyle(dialog.getLabelStyle());
        outputText.setStyleClass(dialog.getLabelClass());
        return outputText;
    }

    @Override
    protected void encodeScriptsAndStyles(FacesContext context, PopupLayer component) throws IOException {
        super.encodeScriptsAndStyles(context, component);
        RenderingUtil.renderInitScript(context, new ScriptBuilder().functionCall("O$.fixInputsWidthStrict",
                new FunctionCallScript("O$", component)));

    }

    private UIComponent getDescriptionField(FacesContext context, EventEditorDialog dialog) {
        UIInput descriptionField = RenderingUtil.getOrCreateFacet(context, dialog,
                HtmlInputTextarea.COMPONENT_TYPE, "descriptionArea", UIInput.class);
        descriptionField.getAttributes().put("styleClass", "o_fullWidthAndHeight");
        descriptionField.getAttributes().put("style", "resize: none");
        return descriptionField;
    }

    private UIComponent getNameField(FacesContext context, EventEditorDialog dialog) {
        UIInput nameField = RenderingUtil.getOrCreateFacet(context, dialog, HtmlInputText.COMPONENT_TYPE, "nameField", UIInput.class);
        nameField.getAttributes().put("styleClass", "o_fullWidth");
        return nameField;
    }

    private UIComponent createDateTimeFields(FacesContext context, EventEditorDialog dialog, String idPrefix) {
        HtmlPanelGrid container = RenderingUtil.getOrCreateFacet(context, dialog,
                HtmlPanelGrid.COMPONENT_TYPE, idPrefix + "Fields", HtmlPanelGrid.class);
        container.setCellpadding("0");
        container.setCellspacing("0");
        container.setBorder(0);
        container.setColumns(3);
        List<UIComponent> children = container.getChildren();
        children.clear();

        children.add(RenderingUtil.getOrCreateFacet(context, dialog, DateChooser.COMPONENT_TYPE, idPrefix + "DateField", DateChooser.class));
        children.add(ComponentUtil.createOutputText(context, HTML.NBSP_ENTITY, false));
        UIInput timeField = RenderingUtil.getOrCreateFacet(context, dialog, HtmlInputText.COMPONENT_TYPE, idPrefix + "TimeField", UIInput.class);
        String timeCls = StyleUtil.mergeClassNames((String) timeField.getAttributes().get("styleClass"), "o_eventEditor_timeField");
        timeField.getAttributes().put("styleClass", timeCls);

        children.add(timeField);
        return container;
    }

    private UIComponent getResourceField(FacesContext context, EventEditorDialog dialog) {
        DropDownField field = RenderingUtil.getOrCreateFacet(context, dialog, DropDownField.COMPONENT_TYPE,
                "resourceField", DropDownField.class);

        List<TimetableResource> resources = (List<TimetableResource>) dialog.getAttributes().get(
                DayTableRenderer.EVENTEDITOR_RESOURCES_ATTR);
        for (TimetableResource resource : resources) {
            field.getChildren().add(new DropDownItem(resource.getName()));
        }

        field.setCustomValueAllowed(false);
        return field;
    }

}
