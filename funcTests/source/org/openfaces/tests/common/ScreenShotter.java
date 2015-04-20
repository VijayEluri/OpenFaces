/*
 * OpenFaces - JSF Component Library 3.0
 * Copyright (C) 2007-2015, TeamDev Ltd.
 * licensing@openfaces.org
 * Unless agreed in writing the contents of this file are subject to
 * the GNU Lesser General Public License Version 2.1 (the "LGPL" License).
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please visit http://openfaces.org/licensing/ for more details.
 */

package org.openfaces.tests.common;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;

/**
 * @author Max Yurin
 */
public class ScreenShotter {
    private final WebDriver driver;
    private static final String PNG = ".png";
    private static final String JPEG = ".jpeg";

    public ScreenShotter(WebDriver driver) {
        this.driver = driver;
    }

    public void makeScreenShot(String path) {
        try {
            File srcFile = null;
            if (driver != null) {
//                if (driver.getClass().equals(RemoteWebDriver.class)) {
//                    srcFile = ((TakesScreenshot) new Augmenter().augment(driver)).getScreenshotAs(OutputType.FILE);
//                } else {
                    srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
//                }
            }

            FileUtils.copyFile(srcFile, new File(path + PNG));
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}