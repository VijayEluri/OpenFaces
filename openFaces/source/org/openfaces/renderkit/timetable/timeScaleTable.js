/*
 * OpenFaces - JSF Component Library 2.0
 * Copyright (C) 2007-2010, TeamDev Ltd.
 * licensing@openfaces.org
 * Unless agreed in writing the contents of this file are subject to
 * the GNU Lesser General Public License Version 2.1 (the "LGPL" License).
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please visit http://openfaces.org/licensing/ for more details.
 */
O$.TimeScaleTable = {};

O$.TimeScaleTable._init = function(componentId,
                                   day,
                                   locale,
                                   dateFormat,
                                   startTimeStr,
                                   endTimeStr,
                                   scrollTimeStr,
                                   preloadedEventParams,
                                   resources,
                                   eventAreaSettings,
                                   editable,
                                   onchange,
                                   editingOptions,
                                   stylingParams,
                                   uiEvent,
                                   timePattern,
                                   timeSuffixPattern,
                                   majorTimeInterval,
                                   minorTimeInterval,
                                   showTimeForMinorIntervals) {

  var timeScaleTable = O$(componentId);

  O$.TimeTableView._init(componentId, day, locale, dateFormat, preloadedEventParams, resources,
          eventAreaSettings, editable, onchange, editingOptions, stylingParams, uiEvent);

  if (!uiEvent)
    uiEvent = {};

  if (editingOptions.overlappedEventsAllowed === undefined) editingOptions.overlappedEventsAllowed = true;

  timeScaleTable._showTimeAgainstMark = stylingParams.timeTextPosition && stylingParams.timeTextPosition == "againstMark";
  var shortestEventTimeWhileResizing = 1000 * 60 * minorTimeInterval;

  var dateTimeFormat = O$.getDateTimeFormatObject(locale);
  if (!startTimeStr)
    startTimeStr = "00:00";
  timeScaleTable._startTimeStr = startTimeStr;
  if (!endTimeStr || endTimeStr == "00:00")
    endTimeStr = "24:00";
  timeScaleTable._endTimeStr = endTimeStr;
  var startTime = O$.parseTime(startTimeStr);
  timeScaleTable._startTime = startTime;
  var endTime = O$.parseTime(endTimeStr);
  timeScaleTable._endTime = endTime;
  if (!scrollTimeStr)
    scrollTimeStr = startTimeStr;
  var scrollTime = O$.parseTime(scrollTimeStr);
  timeScaleTable._scrollTime = scrollTime;
  var startTimeInMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  timeScaleTable._startTimeInMinutes = startTimeInMinutes;
  var endTimeInMinutes = (endTime.getHours() == 0 ? 24 : endTime.getHours()) * 60 + endTime.getMinutes();
  timeScaleTable._endTimeInMinutes = endTimeInMinutes;

  var resourceHeadersRowClass = O$.combineClassNames(["o_resourceHeadersRow", stylingParams.resourceHeadersRowClass]);
  var timetableViewRowClass = O$.combineClassNames(["o_timetableViewRowClass", stylingParams.rowClass]);

  var timeColumnClass = O$.combineClassNames(["o_timeColumn", stylingParams.timeColumnClass]);
  timeScaleTable._timeColumnClass = timeColumnClass;
  var majorTimeStyle = O$.combineClassNames(["o_majorTimeText", stylingParams.majorTimeClass]);
  var minorTimeStyle = O$.combineClassNames(["o_minorTimeText", stylingParams.minorTimeClass]);
  var timeSuffixStyle = O$.combineClassNames(["o_timeSuffixText", stylingParams.timeSuffixClass]);

  var escapeEventNames = uiEvent.escapeName !== undefined ? uiEvent.escapeName : true;
  timeScaleTable._escapeEventNames = escapeEventNames;
  var escapeEventDescriptions = uiEvent.escapeDescription !== undefined ? uiEvent.escapeDescription : true;
  timeScaleTable._escapeEventDescriptions = escapeEventDescriptions;
  var escapeEventResources = uiEvent.escapeResource !== undefined ? uiEvent.escapeResource : true;
  timeScaleTable._escapeEventResources = escapeEventResources;

  var resourceHeadersRowSeparator = stylingParams.resourceHeadersRowSeparator ? stylingParams.resourceHeadersRowSeparator : "1px solid gray";
  var resourceColumnSeparator = stylingParams.resourceColumnSeparator ? stylingParams.resourceColumnSeparator : "1px dotted silver";
  var timeColumnSeparator = stylingParams.timeColumnSeparator ? stylingParams.timeColumnSeparator : "2px solid gray";
  timeScaleTable._timeColumnSeparator = timeColumnSeparator;
  var primaryRowSeparator = stylingParams.primaryRowSeparator ? stylingParams.primaryRowSeparator : "1px solid #b0b0b0";
  timeScaleTable._primaryRowSeparator = primaryRowSeparator;
  var secondaryRowSeparator = stylingParams.secondaryRowSeparator ? stylingParams.secondaryRowSeparator : "1px solid #e4e4e4";
  var timeColumnPrimaryRowSeparator = stylingParams.timeColumnPrimaryRowSeparator ? stylingParams.timeColumnPrimaryRowSeparator : "1px solid #b0b0b0";
  var timeColumnSecondaryRowSeparator = stylingParams.timeColumnSecondaryRowSeparator ? stylingParams.timeColumnSecondaryRowSeparator : "1px solid #e4e4e4";

  var resourceHeadersTable = O$(componentId + "::resourceHeaders");
  timeScaleTable._resourceHeadersTable = resourceHeadersTable;

  if (timeScaleTable._useResourceSeparation) {
    timeScaleTable._resourcesByIds = {};
    timeScaleTable._idsByResourceNames = {};
    for (var resourceIndex = 0; resourceIndex < resources.length; resourceIndex++) {
      var resource = resources[resourceIndex];
      timeScaleTable._resourcesByIds[resource.id] = resource;
      timeScaleTable._idsByResourceNames[resource.name] = resource.id;
      resource._colIndex = resourceIndex + 1;
    }
  }

  var rowHeight = O$.getStyleClassProperty(timetableViewRowClass, "height");
  var duplicatedRows = timeScaleTable._showTimeAgainstMark;
  if (duplicatedRows && rowHeight) {
    var heightPx = O$.calculateNumericCSSValue(rowHeight);
    var additionalRowHeightClass = O$.createCssClass("height: " + Math.ceil(heightPx / 2) + "px ! important");
    timetableViewRowClass = O$.combineClassNames([timetableViewRowClass, additionalRowHeightClass]);
  }

  var forceUsingCellStyles = true; // allow such styles as text-align to be applied to row's cells

  timeScaleTable._initStylesForTables = function() {
    var columnStyles = this._getColumnStyles(timeColumnClass);
    var columns = columnStyles.columns;
    O$.Tables._init(this._table, {
      columns: columns,
      gridLines: [primaryRowSeparator, resourceColumnSeparator, null, null, null, null, null, null, null, null, null],
      body: {rowClassName: timetableViewRowClass},
      forceUsingCellStyles: forceUsingCellStyles
    });

    var headerColumns = columnStyles.headerColumns;
    if (this._useResourceSeparation) {
      O$.Tables._init(resourceHeadersTable, {
        columns: headerColumns,
        gridLines: [primaryRowSeparator, resourceColumnSeparator, null, null, null, null, null, null, null, null, null],
        body: {rowClassName: resourceHeadersRowClass},
        rowStyles: {bodyRowClass: resourceHeadersRowClass},
        forceUsingCellStyles: forceUsingCellStyles
      });
      resourceHeadersTable.style.borderBottom = resourceHeadersRowSeparator;
    }

    if (minorTimeInterval >= majorTimeInterval) {
      // Minor time interval should be less than a major one. Swap them as a fallback.
      var maxInterval = minorTimeInterval;
      minorTimeInterval = majorTimeInterval;
      majorTimeInterval = maxInterval;
    }

    var minorPerMajorIntervals = Math.round(majorTimeInterval / minorTimeInterval);
    if (Math.abs(majorTimeInterval / minorTimeInterval - minorPerMajorIntervals) > 0) {
      // Major time interval is not a multiple of a minor one. Make it a nearest divisible of the major one as a fallback.
      minorTimeInterval = majorTimeInterval / minorPerMajorIntervals;
    }

    var intervalCount = (this._endTimeInMinutes - this._startTimeInMinutes) / minorTimeInterval;
    var roundedIntervalCount = Math.round(intervalCount);
    if (Math.abs(intervalCount - roundedIntervalCount) > 0) {
      // The entire time span from start time to end time should be divisible by a minor time interval.
      // The fallback here is to move end time to the nearest minor interval boundary before the specified end time.
      this._endTimeInMinutes = roundedIntervalCount * minorTimeInterval;
    }
    intervalCount = roundedIntervalCount;

    var now = new Date();
    var minutesPerRow = this._showTimeAgainstMark ? minorTimeInterval / 2 : minorTimeInterval;
    this._minutesPerRow = minutesPerRow;
    for (var timeInMinutes = this._startTimeInMinutes, intervalIndex = 0;
         timeInMinutes < this._endTimeInMinutes;
         timeInMinutes += minorTimeInterval,intervalIndex++) {
      var isMajorMark = (!this._showTimeAgainstMark ? intervalIndex : intervalIndex + 1) % minorPerMajorIntervals == 0;
      var row = this._table.body._createRow();
      var row2 = this._showTimeAgainstMark ? this._table.body._createRow() : null;
      if (row2) row2._row = row;
      row._intervalStartMinutes = timeInMinutes;
      if (row2) row2._intervalStartMinutes = timeInMinutes + minorTimeInterval / 2;
      row._updateTime = function(day) {
        this._time = O$.cloneDate(day);
        this._time.setHours(Math.floor(this._intervalStartMinutes / 60), this._intervalStartMinutes % 60, 0, 0);
      };
      if (row2) row2._updateTime = row._updateTime;
      row._updateTime(now);


      var timeHeader = this._showTimeAgainstMark ? row2.firstChild : row.firstChild;
      var headerCellSpan = 1;
      if (this._showTimeAgainstMark && intervalIndex != intervalCount - 1)
        headerCellSpan = 2;
      if (headerCellSpan != 1)
        timeHeader.rowSpan = headerCellSpan;
      if (intervalIndex == 0 && this._showTimeAgainstMark) {
        var emptyTimeHeader = row.firstChild;
        O$.appendClassNames(emptyTimeHeader, ["o_tinyText"]);
      }
      if (this._showTimeAgainstMark && intervalIndex == intervalCount - 1) {
        O$.appendClassNames(timeHeader, ["o_tinyText"]);
      }

      timeHeader._aHeaderCell = true;
      if (isMajorMark || showTimeForMinorIntervals) {
        if (this._showTimeAgainstMark)
          timeHeader.style.verticalAlign = "middle";
        var excludeTrailingMarkInscription = this._showTimeAgainstMark && headerCellSpan != 2;
        var markTime = row._time;
        if (this._showTimeAgainstMark) {
          markTime = O$.cloneDateTime(markTime);
          markTime.setMinutes(markTime.getMinutes() + minorTimeInterval);
        }

        if (!excludeTrailingMarkInscription) {
          var timeText = dateTimeFormat.format(markTime, timePattern);
          var timeSuffixText = dateTimeFormat.format(markTime, timeSuffixPattern);

          var timeStyle = isMajorMark ? majorTimeStyle : minorTimeStyle;
          var combinedTimeSuffixStyle = O$.combineClassNames([timeStyle, timeSuffixStyle]);
          timeHeader.appendChild(O$.createStyledText(timeText, timeStyle));
          timeHeader.appendChild(O$.createStyledText(timeSuffixText, combinedTimeSuffixStyle));
        }
      }

      var newRows = [row];
      if (row2)
        newRows.push(row2);
      this._table.body._addRows(newRows);

      var cells = row._cells;
      var cells2 = row2 ? row2._cells : null;
      for (var cellIndex = 1, cellCount = cells.length; cellIndex < cellCount; cellIndex++) {
        var cell = cells[cellIndex];
        var cell2 = cells2 ? cells2[cellIndex] : null;
        this._initTableCell(cell, cellIndex);

        if (cell2) {
          cell2._cell = cell;
          cell2.onclick = function() {
            this._cell.onclick();
          };
        }
      }

      if (this._showTimeAgainstMark && intervalIndex > 0)
        row.removeChild(row.firstChild);
    }

    this._table.body._getBorderBottomForCell = function(rowIndex, colIndex, cell) {
      var correctedRowIndex = rowIndex + cell.rowSpan - 1;
      if (duplicatedRows && correctedRowIndex % 2 == 0)
        return "none";
      if (duplicatedRows)
        correctedRowIndex = (correctedRowIndex - 1) / 2;
      if (colIndex == 0) {
        return (correctedRowIndex % minorPerMajorIntervals) == minorPerMajorIntervals - 1 ? timeColumnPrimaryRowSeparator : timeColumnSecondaryRowSeparator;
      } else {
        return (correctedRowIndex % minorPerMajorIntervals) == minorPerMajorIntervals - 1 ? primaryRowSeparator : secondaryRowSeparator;
      }
    };

    if (this._useResourceSeparation) {
      resourceHeadersTable.body._overrideVerticalGridline(0, timeColumnSeparator);
      resourceHeadersTable.body._overrideVerticalGridline(headerColumns.length - 2, O$.isExplorer6() ? "1px solid white" : "1px solid transparent");
    }

  };

  timeScaleTable._getNearestTimeslotForPositionAndRow = function(x, y, row, event) {
    var cell = row._cellFromPoint(x, y, true, this._getLayoutCache());
    var resource;
    if (cell) {
      if (cell._cell) {
        cell = cell._cell;
        row = cell._row;
      }
      var nextCell = cell.nextSibling;
      if (!nextCell)
        resource = cell._resource;
      else {
        if (!cell._resource && nextCell._resource)
          resource = nextCell._resource;
        else {
          var x1 = O$.getElementPos(cell, true, this._getLayoutCache()).x;
          var x2 = O$.getElementPos(nextCell, true, this._getLayoutCache()).x;
          var nearestCell = Math.abs(x - x1) < Math.abs(x - x2) ? cell : nextCell;
          resource = nearestCell._resource;
        }
      }
    }

    if (row._row)
      row = row._row;
    var time;
    var rows = this._table.body._getRows();
    var rowIncrement = this._showTimeAgainstMark ? 2 : 1;
    var nextRow = (row._index + rowIncrement < rows.length) ? rows[row._index + rowIncrement] : null;
    var timeAtPosition = new Date();
    if (!nextRow) {
      time = row._time;
      var rowRect = O$.getElementBorderRectangle(row, true, this._getLayoutCache());
      timeAtPosition.setTime(row._time.getTime() + this._minutesPerRow * 60000 * (y - rowRect.y) / rowRect.height);
    } else {
      var y1 = O$.getElementPos(row, true, this._getLayoutCache()).y;
      var y2 = O$.getElementPos(nextRow, true, this._getLayoutCache()).y;
      var nearestRow = Math.abs(y - y1) < Math.abs(y - y2) ? row : nextRow;
      time = nearestRow._time;
      timeAtPosition.setTime(row._time.getTime() + this._minutesPerRow * 60000 * (y - y1) / (y2 - y1));
    }


    return {resource: resource, time: time, timeAtPosition: timeAtPosition};
  };
  var eventResizeHandleHeight = O$.calculateNumericCSSValue("6px");

  var dragAndDropTransitionPeriod = stylingParams.dragAndDropTransitionPeriod !== undefined ? stylingParams.dragAndDropTransitionPeriod : 70;
  var dragAndDropCancelingPeriod = stylingParams.dragAndDropCancelingPeriod !== undefined ? stylingParams.dragAndDropCancelingPeriod : 200;
  var undroppableStateTransitionPeriod = stylingParams.undroppableStateTransitionPeriod !== undefined ? stylingParams.undroppableStateTransitionPeriod : 250;
  var undroppableEventTransparency = stylingParams.undroppableEventTransparency !== undefined ? stylingParams.undroppableEventTransparency : 0.5;

  var eventsLeftOffset = O$.calculateNumericCSSValue(O$.getStyleClassProperty(timeScaleTable._eventStyleClass, "marginLeft"));
  var eventsRightOffset = O$.calculateNumericCSSValue(O$.getStyleClassProperty(timeScaleTable._eventStyleClass, "marginRight"));
  var reservedEventsLeftOffset = O$.calculateNumericCSSValue(O$.getStyleClassProperty(timeScaleTable._reservedTimeEventClass, "marginLeft"));
  var reservedEventsRightOffset = O$.calculateNumericCSSValue(O$.getStyleClassProperty(timeScaleTable._reservedTimeEventClass, "marginRight"));

  timeScaleTable._getLayoutCache = function() {
    if (!timeScaleTable._cachedPositions)
      timeScaleTable._cachedPositions = {};
    return timeScaleTable._cachedPositions;
  };
  timeScaleTable._getScrollingCache = function() {
    if (!timeScaleTable._cachedScrollPositions)
      timeScaleTable._cachedScrollPositions = {};
    return timeScaleTable._cachedScrollPositions;
  };
  timeScaleTable._resetScrollingCache = function() {
    timeScaleTable._cachedScrollPositions = {};
  };


  timeScaleTable._getEventEditor = function() {
    if (!editable)
      return null;
    return this._eventEditor;
  };
  function adjustRolloverPaddings() {
    var tempDiv = document.createElement("div");

    tempDiv.style.visibility = "hidden";
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "0px";
    tempDiv.style.top = "0px";
    document.body.appendChild(tempDiv);

    setTimeout(function() {
      tempDiv.className = timeScaleTable._eventStyleClass;
      var eventStyleProperties = O$.getElementStyle(tempDiv, ["padding-left", "padding-right", "padding-top", "padding-bottom",
        "border-left-width", "border-top-width", "border-right-width", "border-bottom-width"]);
      tempDiv.className = timeScaleTable._rolloverEventClass;
      var rolloverEventStyleProperties = O$.getElementStyle(tempDiv, ["padding-left", "padding-right", "padding-top", "padding-bottom",
        "border-left-width", "border-top-width", "border-right-width", "border-bottom-width"]);
      document.body.removeChild(tempDiv);

      var userRolloverPaddings = O$.getStyleClassProperties(
              uiEvent.rolloverStyle, ["padding-left", "padding-right", "padding-top", "padding-bottom"]);

      var adjustedStyles = "";

      function adjustPaddingIfNotSpecified(paddingPropertyName, padding, border, rolloverPadding, rolloverBorder) {
        if (userRolloverPaddings[paddingPropertyName])
          return;
        rolloverPadding = O$.calculateNumericCSSValue(padding) + O$.calculateNumericCSSValue(border) - O$.calculateNumericCSSValue(rolloverBorder);
        adjustedStyles += paddingPropertyName + ": " + rolloverPadding + "px; ";
      }

      adjustPaddingIfNotSpecified("padding-left", eventStyleProperties.paddingLeft, eventStyleProperties.borderLeftWidth,
              rolloverEventStyleProperties.paddingLeft, rolloverEventStyleProperties.borderLeftWidth);
      adjustPaddingIfNotSpecified("padding-right", eventStyleProperties.paddingRight, eventStyleProperties.borderRightWidth,
              rolloverEventStyleProperties.paddingRight, rolloverEventStyleProperties.borderRightWidth);
      adjustPaddingIfNotSpecified("padding-top", eventStyleProperties.paddingTop, eventStyleProperties.borderTopWidth,
              rolloverEventStyleProperties.paddingTop, rolloverEventStyleProperties.borderTopWidth);
      adjustPaddingIfNotSpecified("padding-bottom", eventStyleProperties.paddingBottom, eventStyleProperties.borderBottomWidth,
              rolloverEventStyleProperties.paddingBottom, rolloverEventStyleProperties.borderBottomWidth);

      if (adjustedStyles) {
        var newClassName = O$.createCssClass(adjustedStyles);
        timeScaleTable._rolloverEventClass = O$.combineClassNames([timeScaleTable._rolloverEventClass, newClassName]);
      }
    }, 1);
  }


  adjustRolloverPaddings();

  //352
  timeScaleTable._getVertOffsetByHoursAndMinutes = function(hours, minutes) {
    var timeOffsetInMinutes = hours * 60 + minutes - startTimeInMinutes;
    //TODO: duplicatedRows
    //var minutesPerRow = duplicatedRows ? minorTimeInterval / 2 : minorTimeInterval;
    var minutesPerRow = this._minutesPerRow;
    var rowIndex = Math.floor(timeOffsetInMinutes / minutesPerRow);
    var relativePosInsideRow = (timeOffsetInMinutes % minutesPerRow) / minutesPerRow;
    var rows = this._table.body._getRows();
    var correctedRowIndex = rowIndex;
    if (correctedRowIndex < 0)
      correctedRowIndex = 0;
    if (correctedRowIndex >= rows.length)
      correctedRowIndex = rows.length - 1;
    var row = rows[correctedRowIndex];
    var rowRectangle = O$.getElementBorderRectangle(row, true);
    var result = {y: rowRectangle.y + rowRectangle.height * relativePosInsideRow};
    if (rowIndex < 0) {
      result.y += rowRectangle.height * rowIndex;
      result.topTruncated = true;
    }
    if (rowIndex >= rows.length) {
      result.y += rowRectangle.height;
      result.bottomTruncated = !(rowIndex == rows.length && minutes == 0);
    }
    return result;
  };

  O$.addInternalLoadEvent(function() {
    var scrollOffset = timeScaleTable._getVertOffsetByTime(timeScaleTable._scrollTime).y;
    var maxScrollOffset = timeScaleTable._scroller.scrollHeight - O$.getElementSize(timeScaleTable._scroller).height;
    if (maxScrollOffset < 0)
      maxScrollOffset = 0;
    if (scrollOffset > maxScrollOffset)
      scrollOffset = maxScrollOffset;
    timeScaleTable._scroller.scrollTop = scrollOffset;
    O$.addEventHandler(timeScaleTable._scroller, "scroll", function() {
      //TODO: move null to the end
      var timeslot = timeScaleTable._getNearestTimeslotForPosition(10, timeScaleTable._scroller.scrollTop);
      O$.setHiddenField(timeScaleTable, timeScaleTable.id + "::scrollPos", O$.formatTime(timeslot.timeAtPosition));
    });
  });

  timeScaleTable._updateEventElements = function(reacquireDayEvents, refreshAreasAfterReload) {
    this._baseZIndex = O$.getElementZIndex(this);
    if (this._eventElements)
      for (var elementIndex = 0, elementCount = this._eventElements.length; elementIndex < elementCount; elementIndex++) {
        var eventElement = this._eventElements[elementIndex];
        if (refreshAreasAfterReload)
          eventElement._attachAreas();
        this._removeEventElement(eventElement._event);
      }

    this._eventElements = [];
    if (reacquireDayEvents)
      this._events = this._eventProvider._getEventsForPeriod(this._startTime, this._endTime, function() {
        this._updateEventElements(true, true);
      });
    for (var eventIndex = 0, eventCount = this._events.length; eventIndex < eventCount; eventIndex++) {
      var event = this._events[eventIndex];
      this._eventElements.push(this._addEventElement(event));
    }
    this._updateEventZIndexes();
  };

  timeScaleTable._canEventBeDroppedHere = function(event) {
    var startTime = event.start.getTime();
    var endTime = event.end.getTime();
    var resourceId = event.resourceId;
    for (var i = 0, count = this._events.length; i < count; i++) {
      var currEvent = this._events[i];
      if (currEvent == event)
        continue;
      if (currEvent.type != "reserved" && editingOptions.overlappedEventsAllowed)
        continue;
      if (currEvent.resourceId && resourceId && currEvent.resourceId != resourceId)
        continue;
      var timeSpansIntersect =
              currEvent.end.getTime() > startTime &&
                      currEvent.start.getTime() < endTime;
      if (timeSpansIntersect)
        return false;
    }
    return true;
  };

  var addEvent = timeScaleTable._addEvent;
  timeScaleTable._addEvent = function(startTime, resourceId) {
    var event = addEvent(startTime, resourceId);
    this._addEventElement(event);
  };

  timeScaleTable._updateEventsPresentation = function() {
    for (var eventIndex = 0, eventCount = this._events.length; eventIndex < eventCount; eventIndex++) {
      var event = this._events[eventIndex];
      event.updatePresentation();
    }
  };

  var addEventElement = timeScaleTable._addEventElement;
  timeScaleTable._addEventElement = function(event) {
    var eventElement = addEventElement(event);

    eventElement._updatePos = function(draggingInProgress, transitionPeriod, transitionEvents) {
      var resourceColIndex;
      if (event.resourceId) {
        var resource = timeScaleTable._getResourceForEvent(event);
        if (!resource) {
          this.style.display = "none";
          return;
        }
        resourceColIndex = resource._colIndex;
      }
      this.style.display = "";
      var firstDataRow = timeScaleTable._table.body._getRows()[0];

      var leftColBoundaries = this._getLeftColBoundaries(firstDataRow, resourceColIndex);
      var rightColBoundaries = this._getRightColBoundaries(firstDataRow, resourceColIndex);
      var top = this._getTop();
      var bottom = this._getBottom();

      var x1 = leftColBoundaries.getMinX() + (event.type != "reserved" ? eventsLeftOffset : reservedEventsLeftOffset);
      var x2 = rightColBoundaries.getMaxX() - (event.type != "reserved" ? eventsRightOffset : reservedEventsRightOffset);
      if (O$.isExplorer() && O$.isStrictMode() && (resourceColIndex === undefined || resourceColIndex == columns.length - 1)) {
        var scroller = O$(timeScaleTable.id + "::scroller");
        var scrollerWidth = scroller.offsetWidth - scroller.clientWidth;
        x2 -= scrollerWidth;
      }
      var rect = new O$.Rectangle(Math.round(x1), Math.round(top.y),
              Math.round(x2 - x1), Math.round(bottom.y - top.y));
      this._rect = rect;
      if (!transitionPeriod)
        transitionPeriod = 0;
      var backgroundElement = this._backgroundElement;
      if (this._lastRectangleTransition && this._lastRectangleTransition.active)
        this._lastRectangleTransition.stop(1.0);
      var events = {
        onupdate: function() {
          var currentRect = this.propertyValues.rectangle;
          if (currentRect)
            O$.setElementBorderRectangle(backgroundElement, currentRect);
          if (transitionEvents && transitionEvents.onupdate)
            transitionEvents.onupdate();
          eventElement._currentRect = currentRect;
          eventElement._updateAreaPositions(false);
        }
      };
      if (transitionEvents)
        events.oncomplete = transitionEvents.oncomplete;
      this._lastRectangleTransition = O$.runTransitionEffect(this, ["rectangle"], [rect], transitionPeriod, 20, events);

      if (eventElement._updateResizersPos)
        eventElement._updateResizersPos(draggingInProgress);
      var eventZIndex = O$.getNumericElementStyle(this, "z-index");
      this._backgroundElement.style.zIndex = eventZIndex - 1;
      if (bottom.bottomTruncated)
        O$.appendClassNames(this, ["o_truncatedTimetableEvent"]);
      else
        O$.excludeClassNames(this, ["o_truncatedTimetableEvent"]);
      this._updateAreaPositions(true);
    };

    eventElement._update = function(transitionPeriod) {
      this._updatePos(false, transitionPeriod);
      this._updateShape();
    };

    eventElement._setupDragAndDrop = function() {
      var eventPreview = timeScaleTable._getEventPreview();

      eventElement._updateDropAllowed = function() {
        var dropAllowed = timeScaleTable._canEventBeDroppedHere(event);
        if (dropAllowed) {
          eventElement._lastValidStart = event.start;
          eventElement._lastValidEnd = event.end;
          eventElement._lastValidResourceId = event.resourceId;
        }
        eventElement._setDropAllowed(dropAllowed);
      };
      eventElement._setDropAllowed = function(value) {
        if (this._dropAllowed == value)
          return;
        this._dropAllowed = value;

        O$.runTransitionEffect(eventElement, ["opacity"], [value ? 1.0 : 1.0 - undroppableEventTransparency], undroppableStateTransitionPeriod, undefined, {
          onupdate: function() {
            if (this.propertyValues.opacity !== undefined)
              O$.setOpacityLevel(eventElement._backgroundElement, this.propertyValues.opacity * (1 - timeScaleTable._eventBackgroundTransparency));
          }
        });
      };
      eventElement.onmousedown = function (e) {
        timeScaleTable._resetScrollingCache();
        eventElement._bringToFront();
        O$.startDragging(e, this);
        eventElement._initialStart = eventElement._lastValidStart = event.start;
        eventElement._initialEnd = eventElement._lastValidEnd = event.end;
        eventElement._initialResourceId = eventElement._lastValidResourceId = event.resourceId;
        eventElement._originalCursor = O$.getElementStyle(eventElement, "cursor");
        eventElement._dropAllowed = true;
      };

      function hideExcessiveElementsWhileDragging() {
        if (eventPreview)
          setTimeout(function() {
            eventPreview.hide();
          }, 100);
      }

      eventElement.setPosition = function (left, top) {
        if (topResizeHandle)
          topResizeHandle.style.display = "none";
        if (bottomResizeHandle)
          bottomResizeHandle.style.display = "none";

        var nearestTimeslot = timeScaleTable._getNearestTimeslotForPosition(left, top, event);
        var newStartTime = nearestTimeslot.time;
        var newResource = editingOptions.eventResourceEditable ? nearestTimeslot.resource : undefined;
        var eventUpdated = false;
        if (event.resourceId && newResource !== undefined) {
          if (event.resourceId != newResource.id) {
            event.resourceId = newResource.id;
            eventUpdated = true;
          }
        }
        var timeIncrement = newStartTime.getTime() - event.start.getTime();
        if (timeIncrement != 0) {
          var newEndTime = O$.dateByTimeMillis(event.end.getTime() + timeIncrement);
          event.setStart(newStartTime);
          event.setEnd(newEndTime);
          eventUpdated = true;
        }
        if (eventUpdated) {
          eventElement._updateDropAllowed();
          eventElement.style.cursor = "move";//eventElement._setDropAllowed ? "move" : this._originalCursor;
          if (!event._draggingInProgress) {
            event._draggingInProgress = true;
            timeScaleTable._draggingInProgress = true;
            hideExcessiveElementsWhileDragging();
          }
          event.mainElement._updatePos(true, dragAndDropTransitionPeriod, {
            onupdate: function() {
              event._scrollIntoView();
            }
          });

        }
      };
      eventElement.ondragend = function() {
        if (topResizeHandle)
          topResizeHandle.style.display = "";
        if (bottomResizeHandle)
          bottomResizeHandle.style.display = "";

        setTimeout(function() {
          if (event._draggingInProgress) {
            var draggingCanceled = false;
            var dropAllowed = timeScaleTable._canEventBeDroppedHere(event);
            if (!dropAllowed) {
              event.setStart(eventElement._initialStart);//eventElement._lastValidStart);
              event.setEnd(eventElement._initialEnd);//eventElement._lastValidEnd);
              event.resourceId = eventElement._initialResourceId;//eventElement._lastValidResourceId;
              draggingCanceled = true;
            }
            eventElement._setDropAllowed(true);
            eventElement.style.cursor = eventElement._originalCursor;

            if (event.start.getTime() >= timeScaleTable._endTime.getTime() ||
                    event.end.getTime() <= timeScaleTable._startTime.getTime()) {
              timeScaleTable._updateEventElements(true);
            } else {
              event.mainElement._updatePos(false, dragAndDropCancelingPeriod, {
                onupdate: function() {
                  event._scrollIntoView();
                }
              });
            }

            event._draggingInProgress = undefined;
            timeScaleTable._draggingInProgress = undefined;

            if (!draggingCanceled) {
              timeScaleTable._putTimetableChanges(null, [event], null);
            } else {
              event._setMouseInside(false);
            }
          }

        }, 10);
      };
      eventElement._updateResizersPos = function(draggingInProgress) {
        if (!draggingInProgress) {
          var eventRect = event.mainElement._rect;
          if (topResizeHandle)
            O$.setElementBorderRectangle(topResizeHandle, new O$.Rectangle(eventRect.x, eventRect.y - eventResizeHandleHeight / 2, eventRect.width, eventResizeHandleHeight));
          if (bottomResizeHandle)
            O$.setElementBorderRectangle(bottomResizeHandle, new O$.Rectangle(eventRect.x, eventRect.getMaxY() - eventResizeHandleHeight / 2, eventRect.width, eventResizeHandleHeight));
        }
        this._updateZIndex();
      };
      eventElement._updateZIndex = function(eventZIndex) {
        if (eventZIndex === undefined)
          eventZIndex = O$.getNumericElementStyle(event.mainElement, "z-index");
        if (topResizeHandle)
          topResizeHandle.style.zIndex = eventZIndex + 2;
        if (bottomResizeHandle)
          bottomResizeHandle.style.zIndex = eventZIndex + 2;
        this._updateAreaZIndexes();
      };

      if (editingOptions.eventDurationEditable) {
        var topResizeHandle = editingOptions.eventDurationEditable ? document.createElement("div") : null;
        var bottomResizeHandle = editingOptions.eventDurationEditable ? document.createElement("div") : null;
        topResizeHandle.style.fontSize = bottomResizeHandle.style.fontSize = "0px";
        topResizeHandle.style.position = bottomResizeHandle.style.position = "absolute";
        topResizeHandle.style.cursor = "n-resize";
        bottomResizeHandle.style.cursor = "s-resize";

        O$.fixIEEventsForTransparentLayer(topResizeHandle);
        O$.fixIEEventsForTransparentLayer(bottomResizeHandle);

        topResizeHandle.onclick = bottomResizeHandle.onclick = function(e) {
          O$.breakEvent(e);
        };
        topResizeHandle.onmousedown = bottomResizeHandle.onmousedown = eventElement.onmousedown;
        topResizeHandle.setPosition = bottomResizeHandle.setPosition = function(left, top) {
          var nearestTimeslot = timeScaleTable._getNearestTimeslotForPosition(left, top + eventResizeHandleHeight / 2, event);
          var eventUpdated = false;
          if (this == topResizeHandle) {
            if (event.end.getTime() - nearestTimeslot.time < shortestEventTimeWhileResizing)
              nearestTimeslot.time = O$.dateByTimeMillis(event.end.getTime() - shortestEventTimeWhileResizing);
            if (event.start.getTime() != nearestTimeslot.time) {
              event.setStart(nearestTimeslot.time);
              eventUpdated = true;
            }
          } else {
            if (nearestTimeslot.time - event.start.getTime() < shortestEventTimeWhileResizing)
              nearestTimeslot.time = O$.dateByTimeMillis(event.start.getTime() + shortestEventTimeWhileResizing);
            if (event.end.getTime() != nearestTimeslot.time) {
              event.setEnd(nearestTimeslot.time);
              eventUpdated = true;
            }
          }
          if (eventUpdated) {
            event.mainElement._updatePos(true, dragAndDropTransitionPeriod, {
              onupdate: function() {
                event._scrollIntoView();
              }
            });
            eventElement._updateDropAllowed();
          }
          if (eventUpdated && !event._draggingInProgress) {
            event._draggingInProgress = true;
            timeScaleTable._draggingInProgress = true;
            hideExcessiveElementsWhileDragging();
          }
          eventElement._updateResizersPos();
        };
        topResizeHandle.ondragend = bottomResizeHandle.ondragend = eventElement.ondragend;

        function setResizerHoverState(mouseInside, resizer) {
          resizer._mouseInside = mouseInside;
          O$.invokeFunctionAfterDelay(event._updateRolloverState, timeScaleTable.EVENT_ROLLOVER_STATE_UPDATE_TIMEOUT);
        }

        O$.setupHoverStateFunction(topResizeHandle, setResizerHoverState);
        O$.setupHoverStateFunction(bottomResizeHandle, setResizerHoverState);
      }

      eventElement._topResizeHandle = topResizeHandle;
      eventElement._bottomResizeHandle = bottomResizeHandle;
      if (topResizeHandle)
        timeScaleTable._absoluteElementsParentNode.appendChild(topResizeHandle);
      if (bottomResizeHandle)
        timeScaleTable._absoluteElementsParentNode.appendChild(bottomResizeHandle);
      eventElement._removeNodes = function() {
        if (topResizeHandle)
          timeScaleTable._absoluteElementsParentNode.removeChild(topResizeHandle);
        if (bottomResizeHandle)
          timeScaleTable._absoluteElementsParentNode.removeChild(bottomResizeHandle);
        var areas = eventElement._areas;
        for (var i = 0, count = areas.length; i < count; i++) {
          var area = areas[i];
          if (area.parentNode == null)
            continue; // don't add an area back to document if it was already removed by Ajax
          timeScaleTable._hiddenArea.appendChild(area);
        }
      };
    };

    if (event.type != "reserved" && editable) {
      eventElement._setupDragAndDrop();
    }

    eventElement._bringToFront = function() {
      var index = O$.findValueInArray(this, timeScaleTable._eventElements);
      O$.assert(index != -1, "eventElement._bringToFront. Can't find element in _eventElements array.");
      timeScaleTable._eventElements.splice(index, 1);
      timeScaleTable._eventElements.push(this);
      timeScaleTable._updateEventZIndexes();
    };

    event._updateRolloverState = function() {
      var eventElement = event.mainElement;
      if (!eventElement) {
        // this can be the case because _updateRolloverState is invoked by time-out, so if mouseOver/mouseOut happens
        // just before element is replaced with Ajax, this call will be made when there's no original element anymore
        return;
      }
      var actionBar = timeScaleTable._getEventActionBar();
      var elementResizable = eventElement._topResizeHandle || eventElement._bottomResizeHandle;
      event._setMouseInside(eventElement._mouseInside ||
              elementResizable && (eventElement._topResizeHandle._mouseInside || eventElement._bottomResizeHandle._mouseInside) ||
              (actionBar._event == event && actionBar._actionsArea._mouseInside));
    };

    eventElement._updateAreaPositionsAndBorder = function() {
      O$.setElementBorderRectangle(this, this._currentRect);
      eventElement._updateAreaPositions(true);
    };

    event._isEventPreviewAllowed = function() {
      return event._mouseInside && !event._draggingInProgress;
    };

    event._isEventUpdateNotAllowed = function() {
      return event.type == "reserved" || event._draggingInProgress;
    };

    event._beforeUpdate = function() {
    };

    return eventElement;

  };

  timeScaleTable._layoutActionBar = function(actionBar, barHeight, eventElement) {
    var borderLeftWidth = O$.getNumericElementStyle(eventElement, "border-left-width");
    var borderRightWidth = O$.getNumericElementStyle(eventElement, "border-right-width");
    O$.setElementSize(actionBar, {width: eventElement._rect.width - borderLeftWidth - borderRightWidth,
      height: barHeight});
    actionBar.style.left = "0px";
    actionBar.style.bottom = "0px";
  };

};

