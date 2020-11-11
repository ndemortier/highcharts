/* *
 *
 *  (c) 2009-2020 Torstein Honsi
 *
 *  Dot plot series type for Highcharts
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/**
 * @private
 * @todo
 * - Check update, remove etc.
 * - Custom icons like persons, carts etc. Either as images, font icons or
 *   Highcharts symbols.
 */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type ColumnPoint from './Column/ColumnPoint';
import type ColumnPointOptions from './Column/ColumnPointOptions';
import type ColumnSeriesOptions from './Column/ColumnSeriesOptions';
import type { SeriesStatesOptions } from '../Core/Series/SeriesOptions';
import type SVGAttributes from '../Core/Renderer/SVG/SVGAttributes';
import type SVGElement from '../Core/Renderer/SVG/SVGElement';
import type SVGPath from '../Core/Renderer/SVG/SVGPath';
import ColumnSeries from './Column/ColumnSeries.js';
import BaseSeries from '../Core/Series/Series.js';
import SVGRenderer from '../Core/Renderer/SVG/SVGRenderer.js';
import U from '../Core/Utilities.js';
const {
    extend,
    merge,
    objectEach,
    pick
} = U;

import './Column/ColumnSeries.js';

/* *
 *
 *  Declarations
 *
 * */

/**
 * Internal types.
 * @private
 */
declare global {
    namespace Highcharts {
        class DotplotPoint extends ColumnPoint {
            public graphics?: Dictionary<SVGElement>;
            public options: DotplotPointOptions;
            public pointAttr?: SVGAttributes;
            public series: DotplotSeries;
        }
        interface DotplotPointOptions extends ColumnPointOptions {
        }
        interface DotplotSeriesOptions extends ColumnSeriesOptions {
            itemPadding?: number;
            states?: SeriesStatesOptions<DotplotSeries>;
        }
    }
}

/* *
 *
 *  Class
 *
 * */

/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.dotplot
 *
 * @augments Highcharts.Series
 */

class DotplotSeries extends ColumnSeries {

    /* *
     *
     * Static Properties
     *
     * */

    public static defaultOptions: Highcharts.DotplotSeriesOptions = merge(ColumnSeries.defaultOptions, {
        itemPadding: 0.2,
        marker: {
            symbol: 'circle',
            states: {
                hover: {},
                select: {}
            }
        }
    } as Highcharts.DotplotSeriesOptions);

    /* *
     *
     * Properties
     *
     * */

    public data: Array<Highcharts.DotplotPoint> = void 0 as any;

    public options: Highcharts.DotplotSeriesOptions = void 0 as any;

    public points: Array<Highcharts.DotplotPoint> = void 0 as any;

    /* *
     *
     * Functions
     *
     * */

    public drawPoints(): void {
        var series = this,
            renderer = series.chart.renderer,
            seriesMarkerOptions = this.options.marker,
            itemPaddingTranslated = this.yAxis.transA *
                (series.options.itemPadding as any),
            borderWidth = this.borderWidth,
            crisp = borderWidth % 2 ? 0.5 : 1;

        this.points.forEach(function (point: Highcharts.DotplotPoint): void {
            var yPos: number,
                attr: SVGAttributes,
                graphics: Highcharts.Dictionary<SVGElement>,
                itemY: (number|undefined),
                pointAttr,
                pointMarkerOptions = point.marker || {},
                symbol = (
                    pointMarkerOptions.symbol ||
                    (seriesMarkerOptions as any).symbol
                ),
                radius = pick(
                    pointMarkerOptions.radius,
                    (seriesMarkerOptions as any).radius
                ),
                size: number,
                yTop: number,
                isSquare = symbol !== 'rect',
                x: number,
                y: number;

            point.graphics = graphics = point.graphics || {};
            pointAttr = point.pointAttr ?
                (
                    point.pointAttr[point.selected ? 'selected' : ''] ||
                    (series.pointAttr as any)['']
                ) :
                series.pointAttribs(point, (point.selected as any) && 'select');
            delete pointAttr.r;

            if (series.chart.styledMode) {
                delete pointAttr.stroke;
                delete pointAttr['stroke-width'];
            }

            if (point.y !== null) {

                if (!point.graphic) {
                    point.graphic = renderer.g('point').add(series.group);
                }

                itemY = point.y;
                yTop = pick(point.stackY, point.y as any);
                size = Math.min(
                    point.pointWidth,
                    series.yAxis.transA - itemPaddingTranslated
                );
                for (yPos = yTop; yPos > yTop - (point.y as any); yPos--) {

                    x = point.barX + (
                        isSquare ?
                            point.pointWidth / 2 - size / 2 :
                            0
                    );
                    y = series.yAxis.toPixels(yPos, true) +
                        itemPaddingTranslated / 2;

                    if (series.options.crisp) {
                        x = Math.round(x) - crisp;
                        y = Math.round(y) + crisp;
                    }
                    attr = {
                        x: x,
                        y: y,
                        width: Math.round(isSquare ? size : point.pointWidth),
                        height: Math.round(size),
                        r: radius
                    };

                    if (graphics[itemY as any]) {
                        graphics[itemY as any].animate(attr);
                    } else {
                        graphics[itemY as any] = renderer.symbol(symbol)
                            .attr(extend(attr, pointAttr))
                            .add(point.graphic);
                    }
                    graphics[itemY as any].isActive = true;
                    (itemY as any)--;
                }
            }
            objectEach(graphics, function (
                graphic: SVGElement,
                key: string
            ): void {
                if (!graphic.isActive) {
                    graphic.destroy();
                    delete graphic[key];
                } else {
                    graphic.isActive = false;
                }
            });
        });
    }
}

interface DotplotSeries extends ColumnSeries {
    pointAttr?: SVGAttributes;
    pointClass: typeof Highcharts.DotplotPoint;
}

extend(DotplotSeries.prototype, {
    markerAttribs: void 0
});

SVGRenderer.prototype.symbols.rect = function (
    x: number,
    y: number,
    w: number,
    h: number,
    options?: Highcharts.SymbolOptionsObject
): SVGPath {
    return SVGRenderer.prototype.symbols.callout(x, y, w, h, options);
};

/* *
 *
 *  Registry
 *
 * */

declare module '../Core/Series/SeriesType' {
    interface SeriesTypeRegistry {
        dotplot: typeof DotplotSeries;
    }
}

BaseSeries.registerSeriesType('dotplot', DotplotSeries);

/* *
 *
 * Default Export
 *
 * */

export default DotplotSeries;
