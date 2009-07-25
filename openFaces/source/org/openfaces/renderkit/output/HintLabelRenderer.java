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
package org.openfaces.renderkit.output;

import org.openfaces.component.output.HintLabel;
import org.openfaces.renderkit.RendererBase;
import org.openfaces.util.RenderingUtil;
import org.openfaces.util.ResourceUtil;
import org.openfaces.util.ScriptBuilder;
import org.openfaces.util.StyleUtil;
import org.openfaces.util.DefaultStyles;
import org.openfaces.util.EnvironmentUtil;
import org.openfaces.util.StyleGroup;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import java.io.IOException;

/**
 * @author Andrew Palval
 */
public class HintLabelRenderer extends RendererBase {

    public static final String HINT_SUFFIX = RenderingUtil.CLIENT_ID_SUFFIX_SEPARATOR + "hint";

    @Override
    public void encodeEnd(FacesContext context, UIComponent component) throws IOException {
        if (!component.isRendered()) return;

        ResponseWriter writer = context.getResponseWriter();
        HintLabel hintLabel = (HintLabel) component;

        String value = RenderingUtil.getStringValue(context, hintLabel);
        String hint = hintLabel.getHint();

        String defaultHintClass = "o_hintlabel_hint" + ' ' +
                DefaultStyles.getBackgroundColorClass() + ' ' + DefaultStyles.getTextColorClass();
        String hintClass = StyleUtil.getCSSClass(context,
                hintLabel, hintLabel.getHintStyle(), StyleGroup.rolloverStyleGroup(), hintLabel.getHintClass(), defaultHintClass
        );

        writer.startElement("div", hintLabel);
        writeIdAttribute(context, hintLabel);

        String defaultLabelClass = EnvironmentUtil.isExplorer() || EnvironmentUtil.isSafari() || EnvironmentUtil.isUndefinedBrowser()
                ? "o_hintlabel_label_ie" : "o_hintlabel_label";
        writer.writeAttribute("class", StyleUtil.getCSSClass(context,
                hintLabel, hintLabel.getStyle(), defaultLabelClass, hintLabel.getStyleClass()), null);

        writeStandardEvents(writer, hintLabel);

        encodeText(writer, hintLabel, value);
        if (hint != null && !hint.equals(value))
            encodeHint(context, hintLabel, hintClass, hint);

        writer.startElement("div", hintLabel);
        String clientId = component.getClientId(context);
        writer.writeAttribute("id", clientId + "::innerscripts", null);
        ScriptBuilder sb = new ScriptBuilder();
        sb.initScript(context, hintLabel, "O$.HintLabel._init",
                hintLabel.getHintTimeout(),
                hintClass,
                RenderingUtil.getRolloverClass(context, hintLabel));

        RenderingUtil.renderInitScript(context, sb, new String[]{
                ResourceUtil.getUtilJsURL(context),
                ResourceUtil.getInternalResourceURL(context, HintLabelRenderer.class, "hintLabel.js")
        });
        StyleUtil.renderStyleClasses(context, hintLabel);
        writer.endElement("div");
        writer.endElement("div");
    }

    private void encodeHint(FacesContext context, HintLabel hintLabel, String hintClass, String hint) throws IOException {
        ResponseWriter writer = context.getResponseWriter();

        writer.startElement("div", hintLabel);
        writer.writeAttribute("id", hintLabel.getClientId(context) + HINT_SUFFIX, null);
        writer.writeAttribute("class", hintClass, null);
        encodeText(writer, hintLabel, hint);
        writer.endElement("div");
    }

    private void encodeText(ResponseWriter writer, HintLabel hintLabel, String text) throws IOException {
        if (text == null)
            return;

        boolean escape = hintLabel.isEscape();
        if (escape)
            writer.writeText(text, null);
        else
            writer.write(text);
    }
}
