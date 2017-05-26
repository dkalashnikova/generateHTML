# модуль вспомогательных функций

from functools import reduce



# функция получения элемента последовательности lst
# произвольной размерности по заданному кортежем indxs индексу
def get_el(lst, indxs):
    args = [lst]
    args += list(indxs)
    return reduce(lambda lst, i: lst[i], args)


# функция установления значения val элементу последовательности
# произвольной размерности под индексом, заданным кортежем indxs,
# если до этого элемент имел значение None, или значения,
# возвращаемому функцией func_if_el_exist, если до этого элемент
# имел значение, не являющееся None
def set_el(lst, indxs, val, func_if_el_exist = (lambda el, v: v)):
    args = [lst]
    args += list(indxs[:-1])
    target_arr = reduce(lambda lst, i: lst[i], args)
    exist_el = get_el(lst, indxs)
    if not exist_el:
        target_arr[indxs[-1]] = val
    else:
        target_arr[indxs[-1]] = func_if_el_exist(exist_el, val)



