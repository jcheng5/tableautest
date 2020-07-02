define("dump", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function default_1() {
        await tableau.extensions.initializeAsync({ configure: configure });
        const dashboard = tableau.extensions.dashboardContent.dashboard;
        console.log(`Dashboard name: ${dashboard.name}`);
        for (const worksheet of dashboard.worksheets) {
            console.log(`Worksheet: ${worksheet.name}`);
            for (const ds of await worksheet.getDataSourcesAsync()) {
                console.log(`Data source: ${ds.name}`);
            }
            for (const table of await worksheet.getUnderlyingTablesAsync()) {
                console.log(`Underlying table: ${table.caption} (${table.id})`);
            }
        }
    }
    exports.default = default_1;
    function configure() {
        return {};
    }
});
//# sourceMappingURL=app.js.map