import { read } from 'xlsx';

export type CommonArgument = {
    /**
     * xlsx files you want to get tuples.
     * 
     * 'source' file may not have values in 'template-var' position, then field of 'tuple' will be undefined.
     * 
     * you can see 'source' field in 'Row' type.
     * 
     * @see Row
     */
    source: Blob[] | FileList;
    /**
     * xlsx file has 'template-var' surrounded by `${}` e.g. ${XXX}.
     * 
     * the 'template-var' should satisfy all;
     * - in its cell, be consist of only `${}` form
     * - var-name should be /^[0-9a-zA-Z_]+$/
     * - all white space count sensitivity in its cell is unspecified 
     */
    template: Blob;
};

export default (arg: CommonArgument) => async () => {
    // helpers declarations
    let template: Template;
    const templates = async (): Promise<void> => {
        const { Sheets } = read(await arg.template.arrayBuffer());
        const rvar = /^\$\{([a-zA-Z0-9_]+)\}$/
        template = {
            values: Object.entries(Sheets)
                .map(([sheet, table]) => Object.entries(table).filter(([cell, t]) => t.t === 's' && rvar.test(t.w || ''))
                    .map(([cell, t]) => ({
                        sheet,
                        cell,
                        rvar: t.v.match(rvar)[1]
                    }))
                ).flat()
        };
    };

    let source: Blob[];
    let row: Row[] = [];
    const rows = async (): Promise<void> => {
        row = await Promise.all(source.map(async source => {
            const { Sheets } = read(await source.arrayBuffer());
            return {
                source,
                tuple: Object.fromEntries(template.values.map(({ sheet, cell, rvar }) => {
                    const c = Sheets[sheet][cell];
                    return [rvar, c.w];
                }))
            }
        }));
    };

    const sources = () => {
        if (Array.isArray(arg.source)) {
            source = arg.source;
        } else {
            source = [];
            for (let src = 0, end = arg.source.length; src < end; src++) {
                const s = arg.source.item(src);
                s && source.push(s);
            }
        }
    };

    // impls main control flow
    await templates();
    sources();
    await rows();

    return row;
};

type Template = {
    values: {
        sheet: string;
        cell: string;
        rvar: string;
    }[];
};

export type Row = {
    /**
     * same pointer in 'source' of 'arg'.
     * 
     * 'tuple' field came up from this 'source' field.
     * 
     * @see CommonArgument
     */
    source: Blob;

    /**
     * tuples named by 'template-var-name'.
     * 
     * 'var-name' is nakid styled, so you can get `tuple['XXX']` for `${XXX}` value in source.
     * 
     * tuple values are;
     * - unspecified if 'template-var' duplicated in 'template' xlsx file
     * - undefined if cell was not found in 'source' xlsx file
     * - the value of `tuple['XXX']` is formatted text, so `=1+1` gives `'2'`
     */
    tuple: { [rvar in string]?: string };
};
