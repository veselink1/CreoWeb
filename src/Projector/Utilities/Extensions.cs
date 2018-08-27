using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector
{
    public static class Objects
    {
        public static T ValueOr<T>(this T value, T defaultValue)
        {
            return value != null ? value : defaultValue;
        }
        public static T ValueOr<T>(this T value, Func<T> defaultValue)
        {
            return value != null ? value : defaultValue();
        }

        public static T ValueAnd<T>(this T value, T otherValue)
        {
            return value == null ? value : otherValue;
        }
        public static T ValueAnd<T>(this T value, Func<T> otherValue)
        {
            return value == null ? value : otherValue();
        }

        public static bool IsNull<T>(this T value)
        {
            return value == null;
        }
        public static bool IsNotNull<T>(this T value)
        {
            return value != null;
        }
    }

    public static class Lists
    {
        public static bool TryFind<T>(this IList<T> list, Predicate<T> predicate, out T result)
        {
            foreach (var x in list) 
            {
                if (predicate(x))
                {
                    result = x;
                    return true;
                }
            }
            result = default(T);
            return false;
        }
    }
}
