
args = { ... }

if args[1] == '-s' then
  save = true
  table.remove(args, 1)
end

if #args == 0 then
  args = { 'read' }
end

files = {
  '', 'a', 'ab', 'abc',
  '\n', 'a\n', '\nb', 'a\nb',
  '\n\n', 'a\n\n', '\nb\n', '\n\nc', '\nb\nc', 'a\n\nc', 'a\nb\n', 'a\nb\nc',
  '1', '12', '12.3', '12.3 4.56', '12.3 4.56\n-7.8.9',
  'abc 123 def\n456 ghi 78\n  jkl  90  ',
  '!@#$%^&*()',
}

modes = { 'r', 'w', 'a', 'r+', 'w+', 'a+' }

ops = {
  { 'read' },
  { 'read', 'n' },
  { 'read', 'a' },
  { 'read', 'l' },
  { 'read', 'L' },
  { 'read', 0 },
  { 'read', 1 },
  { 'read', 2 },
  { 'read', 10 },
}

-- compatibility
loadfile = (_VERSION == 'Lua 5.3') and loadfile or function(filename)
  local f = assert(io.open(filename, 'r'))
  local s = assert(f:read('a'))
  f:close()
  return loadstring(s)
end

function begin_run(tag)
  io.write(tag, ': ')
  io.stdout:flush()
  test_count, pass_count, fail_count = 0, 0, 0
  if save then
    expectfile = io.open(tag .. '.expect', 'w')
    expectfile:write('return {\n')
  else
    expectdata = loadfile(tag .. '.expect')()
  end
end

function begin_test(file, mode, offset, ...)
  test_count = test_count + 1
  test = { file, mode, offset, ...}

  f = io.open('testfile', 'w')
  f:write(file)
  f:close()

  f = io.open('testfile', mode)
  if offset then
    f:seek('set', offset)
  end
end

function pass()
  pass_count = pass_count + 1
end

function fail()
  fail_count = fail_count + 1
end

function end_test(...)
  if save then
    expectfile:write('{ ')
    for i = 1, select('#', ...) do
      local v = select(i, ...)
      expectfile:write((type(v) == 'string') and string.format('[[\n%s]]', v) or tostring(v), ', ')
    end
    expectfile:write(' },\n')
  else
    local expect = expectdata[test_count]
    for i = 1, select('#', ...) do
      if select(i, ...) ~= expect[i] then
        log(table.unpack(test))
        log('EXPECT ' .. i .. ' <' .. tostring(expect[i]) .. '> GOT <' .. tostring(select(i, ...)) .. '>')
        fail()
        return
      end
    end
    pass()
  end
end

function end_run()
  io.write(string.format('%d %s\n', test_count, save and 'saved' or 'tested'))
  if save then
    expectfile:write('}\n')
  else
    print(string.format('  %d passed  %d failed', pass_count, fail_count))
  end
end

function run_read()
  for _, file in ipairs(files) do
    for _, mode in ipairs(modes) do
      for offset = 0, #file + 3 do
        for _, op in ipairs(ops) do
          begin_test(file, mode, offset, table.unpack(op))
          r, e = f[op[1]](f, table.unpack(op, 2))
          e = type(e)
          s = f:seek()
          f:close()
          end_test(r, e, s)
        end
      end
    end
  end
end

while #args > 0 do
  local tag = table.remove(args, 1)
  local runf = _G['run_' .. tag]
  if runf then
    begin_run(tag)
    runf()
    end_run()
  end
end
