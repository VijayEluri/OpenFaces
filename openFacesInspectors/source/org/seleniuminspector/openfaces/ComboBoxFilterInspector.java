/*
 * OpenFaces - JSF Component Library 3.0
 * Copyright (C) 2007-2013, TeamDev Ltd.
 * licensing@openfaces.org
 * Unless agreed in writing the contents of this file are subject to
 * the GNU Lesser General Public License Version 2.1 (the "LGPL" License).
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please visit http://openfaces.org/licensing/ for more details.
 */
package org.seleniuminspector.openfaces;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.support.ui.Select;
import org.seleniuminspector.LoadingMode;

/**
 * @author Andrii Gorbatov
 */
public class ComboBoxFilterInspector extends AbstractFilterInspector {

    public ComboBoxFilterInspector(String locator, LoadingMode loadingMode) {
        super(locator, loadingMode);
    }

    public void makeFiltering(String filterValue) {
        WebDriver driver = ((WrapsDriver) getSelenium()).getWrappedDriver();
        Select select = new Select(driver.findElement(By.xpath(getXPath())));
        select.selectByVisibleText(filterValue);
        getLoadingMode().waitForLoad();
    }

}
