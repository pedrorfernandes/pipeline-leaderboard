/**
 * Perform an "Upsert" using the "INSERT ... ON CONFLICT ... " syntax in PostgreSQL 9.5
 * @link http://www.postgresql.org/docs/9.5/static/sql-insert.html
 * @author https://github.com/plurch
 *
 * @param {string} tableName - The name of the database table
 * @param {string} conflictTarget - The column in the table which has a unique index constraint
 * @param {Object} itemData - a hash of properties to be inserted/updated into the row
 * @returns {Promise} - A Promise which resolves to the inserted/updated row
 */
function upsertItems(knex: any, tableName: string, conflictTarget: string, itemData: any) {
    let firstObjectIfArray = Array.isArray(itemData) ? itemData[0] : itemData;
    let exclusions = Object.keys(firstObjectIfArray)
        .filter(c => c !== conflictTarget)
        .map(c => knex.raw('?? = EXCLUDED.??', [c, c]).toString())
        .join(",\n");

    let insertString = knex(tableName).insert(itemData).toString();
    let conflictString = knex
        .raw(` ON CONFLICT (??) DO UPDATE SET ${exclusions} RETURNING *;`, conflictTarget).toString();
    let query = (insertString + conflictString).replace(/\?/g, '\\?');

    return knex.raw(query)
        // .on('query', data => console.log('Knex: ' + data.sql))
        .then(result => result.rows);
};

export {
    upsertItems as upsertItems
}