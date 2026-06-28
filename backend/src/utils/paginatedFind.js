const paginate = require("./paginate");
const ApiResponse = require("./ApiResponse");

async function paginatedFind(model, req, res, { where = {}, orderBy = { createdAt: "desc" }, include } = {}) {
  const { skip, take, page, limit } = paginate(req.query);
  const findOptions = { where, skip, take, orderBy };
  if (include) findOptions.include = include;

  const [data, total] = await Promise.all([
    model.findMany(findOptions),
    model.count({ where }),
  ]);

  ApiResponse.paginated(res, { data, page, limit, total });
}

module.exports = paginatedFind;
